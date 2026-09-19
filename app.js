const app = document.getElementById('app');
const toolNav = document.getElementById('tool-nav');

const state = {
  era: 'all',       // 'all' | 'current' | 'older'
  category: 'all',
  level: 'all',     // 'all' | 'Beginner' | 'Intermediate' | 'Advanced'
  length: 'all',    // 'all' | 'short' | 'medium' | 'long'
  query: '',
  sort: 'default',  // 'default' | 'rating'
  userRecommended: false,
  verifiedOnly: false
};

const USER_RECOMMENDED_MIN_SCORE = 2;
const WEB3FORMS_ACCESS_KEY = '444d642e-e41c-48eb-9d65-38c0086ddcbb'; // from web3forms.com, tied to samtailford3@gmail.com

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// The "level" field is free text like "Beg/Int" or "Absolute beginner" —
// match by substring so every variant lands in the right bucket(s).
function levelBuckets(raw) {
  const s = (raw || '').toLowerCase();
  const out = [];
  if (s.includes('beg')) out.push('Beginner');
  if (s.includes('int')) out.push('Intermediate');
  if (s.includes('adv')) out.push('Advanced');
  return out;
}

// The "length" field is free text ("23 min", "1h17m", "16-part series", ...)
// rather than a clean duration. Parse what we can into total minutes and
// bucket it; fall back to keyword heuristics when there's no parsable number.
function estimateMinutes(raw) {
  const s = raw.toLowerCase();
  let m;
  if ((m = s.match(/(\d+)\s*h(?:r|our)?s?\s*(\d+)\s*m/))) return +m[1] * 60 + +m[2];
  if ((m = s.match(/^(\d+):(\d+)$/))) return +m[1] + (+m[2] >= 30 ? 1 : 0);
  if ((m = s.match(/(\d+)\s*[-–]\s*(\d+)\s*hrs?\b/))) return (+m[1] + +m[2]) / 2 * 60;
  if ((m = s.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:hrs?|hours?)\b/))) return parseFloat(m[1]) * 60 + (s.includes('+') ? 1 : 0);
  if ((m = s.match(/^(\d+)h$/))) return +m[1] * 60;
  if ((m = s.match(/(\d+)\s*[-–]\s*(\d+)\s*min/))) return (+m[1] + +m[2]) / 2;
  if ((m = s.match(/(\d+(?:\.\d+)?)\s*\+?\s*min/))) return parseFloat(m[1]) + (s.includes('+') ? 1 : 0);
  if ((m = s.match(/(\d+)\s*(?:parts?|episodes?|eps?)\b/))) return +m[1] * 15;
  return null;
}

function lengthBucket(raw) {
  const s = (raw || '').toLowerCase();
  let minutes = estimateMinutes(s);
  if (minutes == null) {
    if (/course|mini-degree|ongoing|long/.test(s)) minutes = 300;
    else if (/single (video|upload)|sample|docs|files/.test(s)) minutes = 30;
    else if (/written|walkthrough|series|multi-part|multi-lesson/.test(s)) minutes = 120;
    else return null;
  }
  if (minutes <= 60) return 'short';
  if (minutes <= 240) return 'medium';
  return 'long';
}

async function loadData() {
  // DATA is loaded inline from data.js (no fetch) so this page also works
  // when opened directly as a local file, with no server required.
}

function buildNav() {
  toolNav.innerHTML = Object.keys(TOOL_META).map(key => {
    const meta = TOOL_META[key];
    return `<a href="#/${key}" data-tool="${key}">${TOOL_ICONS[key]}${meta.label}</a>`;
  }).join('');
}

function onAuthChange() {
  renderAccountArea();
  route();
}

function renderAccountArea() {
  const area = document.getElementById('account-area');
  const user = getCurrentUser();
  const profile = getCurrentProfile();
  if (!user) {
    area.innerHTML = `<button class="signin-btn" id="signin-open-btn">Sign in</button>`;
    document.getElementById('signin-open-btn').addEventListener('click', () => openAuthModal('signin'));
    return;
  }
  const name = profile ? profile.username : user.email;
  area.innerHTML = `
    <a href="#/account" class="account-pill">${esc(name)}</a>
    <button class="signout-btn" id="signout-btn" title="Sign out">&#8594;</button>
  `;
  document.getElementById('signout-btn').addEventListener('click', async () => {
    await signOut();
  });
}

function openAuthModal(mode) {
  const overlay = document.getElementById('auth-modal-overlay');
  overlay.style.display = 'flex';
  renderAuthModal(mode || 'signin', '');

  overlay.onclick = (e) => { if (e.target === overlay) closeAuthModal(); };
}

function closeAuthModal() {
  const overlay = document.getElementById('auth-modal-overlay');
  overlay.style.display = 'none';
  overlay.innerHTML = '';
}

function renderAuthModal(mode, errorMsg) {
  const overlay = document.getElementById('auth-modal-overlay');
  const isSignUp = mode === 'signup';
  overlay.innerHTML = `
    <div class="auth-modal">
      <button class="auth-modal-close" id="auth-modal-close">&times;</button>
      <h2>${isSignUp ? 'Create an account' : 'Sign in'}</h2>
      <p class="auth-modal-sub">${isSignUp ? 'Save tutorials, track what you\'ve completed.' : 'Welcome back.'}</p>
      ${errorMsg ? `<p class="auth-error">${esc(errorMsg)}</p>` : ''}
      <form id="auth-form">
        ${isSignUp ? `<input type="text" id="auth-username" placeholder="Username" required minlength="3" maxlength="24">` : ''}
        <input type="email" id="auth-email" placeholder="Email" required>
        <input type="password" id="auth-password" placeholder="Password" required minlength="6">
        <button type="submit" class="auth-submit-btn">${isSignUp ? 'Create account' : 'Sign in'}</button>
      </form>
      <p class="auth-switch">
        ${isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <a href="#" id="auth-switch-link">${isSignUp ? 'Sign in' : 'Sign up'}</a>
      </p>
    </div>
  `;
  document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);
  document.getElementById('auth-switch-link').addEventListener('click', (e) => {
    e.preventDefault();
    renderAuthModal(isSignUp ? 'signin' : 'signup', '');
  });
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const submitBtn = e.target.querySelector('.auth-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Working...';
    let result;
    if (isSignUp) {
      const username = document.getElementById('auth-username').value.trim();
      result = await signUp(email, password, username);
    } else {
      result = await signIn(email, password);
    }
    if (result.error) {
      renderAuthModal(mode, result.error.message || 'Something went wrong.');
      return;
    }
    if (result.needsEmailConfirm) {
      const overlay = document.getElementById('auth-modal-overlay');
      overlay.innerHTML = `
        <div class="auth-modal">
          <button class="auth-modal-close" id="auth-modal-close">&times;</button>
          <h2>Check your email</h2>
          <p class="auth-modal-sub">We sent a confirmation link to ${esc(email)}. Click it, then sign in here.</p>
        </div>`;
      document.getElementById('auth-modal-close').addEventListener('click', closeAuthModal);
      return;
    }
    closeAuthModal();
  });
}

function renderHome() {
  document.title = 'LearnGameDev — Free tutorials that actually finish something';
  const cards = Object.keys(TOOL_META).map(key => {
    const meta = TOOL_META[key];
    const total = DATA[key].current.length + DATA[key].older.length;
    return `
      <a href="#/${key}" class="tool-card" style="--tool-accent:${meta.accent}">
        <div class="icon">${TOOL_ICONS[key]}</div>
        <h2>${meta.label}</h2>
        <p class="tagline">${meta.tagline}</p>
        <span class="count">${total}+ tutorials</span>
      </a>`;
  }).join('');

  app.innerHTML = `
    <div class="hero">
      <h1>LEARNGAMEDEV</h1>
      <p>A compendium of free, complete tutorials and tutorial series. You can find assets and links to text-based tutorial hubs and other handy stuff in the <a href="#/more">More</a> section. This compendium covers every aspect of game development — pick your tool.</p>
    </div>
    <div class="tool-grid">${cards}</div>
  `;
}

function allEntries(toolKey) {
  const t = DATA[toolKey];
  return [
    ...t.current.map(e => ({...e, era: 'current'})),
    ...t.older.map(e => ({...e, era: 'older'})),
    ...(t.outdated || []).map(e => ({...e, era: 'outdated'}))
  ];
}

function renderTool(toolKey) {
  const meta = TOOL_META[toolKey];
  if (!meta) { location.hash = '#/'; return; }
  document.title = `${meta.label} — LearnGameDev`;

  const entries = allEntries(toolKey).map(e => ({ ...e, vote: getVoteState(e.id) }));
  const categories = ['all', ...Array.from(new Set(entries.map(e => e.category)))];

  let filtered = entries.filter(e => {
    if (state.era !== 'all' && e.era !== state.era) return false;
    if (state.category !== 'all' && e.category !== state.category) return false;
    if (state.level !== 'all' && !levelBuckets(e.level).includes(state.level)) return false;
    if (state.length !== 'all' && lengthBucket(e.length) !== state.length) return false;
    if (state.verifiedOnly && !e.verified) return false;
    if (state.userRecommended && e.vote.score < USER_RECOMMENDED_MIN_SCORE) return false;
    if (state.query) {
      const q = state.query.toLowerCase();
      const hay = `${e.title} ${e.creator} ${e.category} ${e.outcome}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (state.sort === 'rating' || state.userRecommended) {
    filtered = filtered.slice().sort((a, b) => b.vote.score - a.vote.score || b.vote.up - a.vote.up);
  }

  const currentCount = entries.filter(e => e.era === 'current').length;
  const olderCount = entries.filter(e => e.era === 'older').length;
  const outdatedCount = entries.filter(e => e.era === 'outdated').length;
  const verifiedCount = entries.filter(e => e.verified).length;
  const userRecCount = entries.filter(e => e.vote.score >= USER_RECOMMENDED_MIN_SCORE).length;
  const levelCount = lvl => entries.filter(e => levelBuckets(e.level).includes(lvl)).length;
  const lengthCount = len => entries.filter(e => lengthBucket(e.length) === len).length;

  app.innerHTML = `
    <a href="#/" class="back-link">&larr; All tools</a>
    <div class="tool-header" style="--tool-accent:${meta.accent}">
      <div class="icon">${TOOL_ICONS[toolKey]}</div>
      <div class="tool-header-text">
        <h1>${meta.label}</h1>
        <p class="sub">${entries.length} vetted free tutorials &middot; ${meta.tagline}</p>
      </div>
      <a class="get-tool-btn" href="${esc(meta.downloadUrl)}" target="_blank" rel="noopener noreferrer">
        Get ${esc(meta.label)} &#8599;
        <span class="get-tool-note">${esc(meta.downloadNote)}</span>
      </a>
    </div>

    <div class="controls" style="--tool-accent:${meta.accent}">
      <div class="search-row">
        <input type="text" id="search-input" placeholder="Search title, creator, or outcome..." value="${esc(state.query)}">
        <div class="era-toggle">
          <button data-era="all" class="${state.era === 'all' ? 'active' : ''}">All (${entries.length})</button>
          <button data-era="current" class="${state.era === 'current' ? 'active' : ''}">Current (${currentCount})</button>
          <button data-era="older" class="${state.era === 'older' ? 'active' : ''}">Older (${olderCount})</button>
          <button data-era="outdated" class="${state.era === 'outdated' ? 'active' : ''}">Outdated (${outdatedCount})</button>
        </div>
      </div>
      <div class="sort-row">
        <div class="era-toggle">
          <button data-sort="default" class="${state.sort === 'default' ? 'active' : ''}">Default order</button>
          <button data-sort="rating" class="${state.sort === 'rating' ? 'active' : ''}">Highest rated</button>
        </div>
        <div class="badge-toggles">
          <button id="verified-toggle" class="verified-pill ${state.verifiedOnly ? 'active' : ''}">&#10003; Verified (${verifiedCount})</button>
          <button id="user-rec-toggle" class="recommended-pill ${state.userRecommended ? 'active' : ''}">&#9733; User Recommended (${userRecCount})</button>
        </div>
      </div>
      <div class="category-pills">
        ${categories.map(c => `<button data-cat="${esc(c)}" class="${state.category === c ? 'active' : ''}">${c === 'all' ? 'All categories' : esc(c)}</button>`).join('')}
      </div>
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">Level</span>
          <div class="category-pills">
            <button data-level="all" class="${state.level === 'all' ? 'active' : ''}">All</button>
            <button data-level="Beginner" class="${state.level === 'Beginner' ? 'active' : ''}">Beginner (${levelCount('Beginner')})</button>
            <button data-level="Intermediate" class="${state.level === 'Intermediate' ? 'active' : ''}">Intermediate (${levelCount('Intermediate')})</button>
            <button data-level="Advanced" class="${state.level === 'Advanced' ? 'active' : ''}">Advanced (${levelCount('Advanced')})</button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">Length</span>
          <div class="category-pills">
            <button data-length="all" class="${state.length === 'all' ? 'active' : ''}">All</button>
            <button data-length="short" class="${state.length === 'short' ? 'active' : ''}">Short, &lt;1hr (${lengthCount('short')})</button>
            <button data-length="medium" class="${state.length === 'medium' ? 'active' : ''}">Medium, 1-4hr (${lengthCount('medium')})</button>
            <button data-length="long" class="${state.length === 'long' ? 'active' : ''}">Long, 4hr+ (${lengthCount('long')})</button>
          </div>
        </div>
      </div>
    </div>

    <p class="result-count">${filtered.length} tutorial${filtered.length === 1 ? '' : 's'}</p>

    <div class="card-grid" style="--tool-accent:${meta.accent}">
      ${filtered.length ? filtered.map(cardHtml).join('') : ''}
    </div>
    ${filtered.length ? '' : '<p class="empty-state">No tutorials match those filters. Try clearing the search or category.</p>'}
  `;

  document.getElementById('search-input').addEventListener('input', e => {
    state.query = e.target.value;
    renderTool(toolKey);
    document.getElementById('search-input').focus();
    const val = document.getElementById('search-input').value;
    document.getElementById('search-input').setSelectionRange(val.length, val.length);
  });

  app.querySelectorAll('.era-toggle button[data-era]').forEach(btn => {
    btn.addEventListener('click', () => { state.era = btn.dataset.era; renderTool(toolKey); });
  });
  app.querySelectorAll('.era-toggle button[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => { state.sort = btn.dataset.sort; renderTool(toolKey); });
  });
  document.getElementById('verified-toggle').addEventListener('click', () => {
    state.verifiedOnly = !state.verifiedOnly;
    renderTool(toolKey);
  });
  document.getElementById('user-rec-toggle').addEventListener('click', () => {
    state.userRecommended = !state.userRecommended;
    renderTool(toolKey);
  });
  app.querySelectorAll('.category-pills button[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => { state.category = btn.dataset.cat; renderTool(toolKey); });
  });
  app.querySelectorAll('.category-pills button[data-level]').forEach(btn => {
    btn.addEventListener('click', () => { state.level = btn.dataset.level; renderTool(toolKey); });
  });
  app.querySelectorAll('.category-pills button[data-length]').forEach(btn => {
    btn.addEventListener('click', () => { state.length = btn.dataset.length; renderTool(toolKey); });
  });

  app.querySelector('.card-grid').addEventListener('click', e => {
    const voteBtn = e.target.closest('.vote-btn');
    const saveBtn = e.target.closest('.save-btn');
    const completeBtn = e.target.closest('.complete-btn');
    if (voteBtn) {
      if (!getCurrentUser()) { openAuthModal('signin'); return; }
      castVote(voteBtn.dataset.id, voteBtn.dataset.dir).then(() => renderTool(toolKey));
      return;
    }
    if (saveBtn) {
      if (!getCurrentUser()) { openAuthModal('signin'); return; }
      toggleSaved(saveBtn.dataset.id).then(() => renderTool(toolKey));
      return;
    }
    if (completeBtn) {
      if (!getCurrentUser()) { openAuthModal('signin'); return; }
      toggleCompleted(completeBtn.dataset.id).then(() => renderTool(toolKey));
      return;
    }
  });
}

function cardHtml(e) {
  const signupFlag = /signup|account|unity id/i.test(e.access) && !/no signup/i.test(e.access);
  const v = e.vote;
  const userRecommended = v.score >= USER_RECOMMENDED_MIN_SCORE;
  return `
    <div class="entry-card">
      <div class="card-top-row">
        <span class="cat-tag">${esc(e.category)}</span>
        <div class="badge-group">
          ${e.verified ? '<span class="verified-badge">&#10003; Verified</span>' : ''}
          ${userRecommended ? '<span class="rec-badge">&#9733; User Recommended</span>' : ''}
        </div>
      </div>
      <h3>${esc(e.title)}</h3>
      <p class="creator">${esc(e.creator)}</p>
      <p class="outcome">${esc(e.outcome)}</p>
      <div class="meta-row">
        <span class="meta-chip era-${e.era}">${e.era === 'current' ? 'Current' : e.era === 'older' ? 'Older' : 'Outdated'}</span>
        <span class="meta-chip">${esc(e.level)}</span>
        <span class="meta-chip">${esc(e.length)}</span>
        <span class="meta-chip">${esc(e.date)}</span>
        ${signupFlag ? `<span class="meta-chip signup">Signup required</span>` : ''}
      </div>
      <div class="card-bottom-row">
        <a class="watch-link" href="${esc(e.link)}" target="_blank" rel="noopener noreferrer">View tutorial &rarr;</a>
        <div class="vote-group">
          <button class="save-btn ${isSaved(e.id) ? 'active' : ''}" data-id="${esc(e.id)}" title="Save for later">${isSaved(e.id) ? '&#9733;' : '&#9734;'}</button>
          <button class="complete-btn ${isCompleted(e.id) ? 'active' : ''}" data-id="${esc(e.id)}" title="Mark completed">&#10003;</button>
          <button class="vote-btn ${v.myVote === 'up' ? 'voted' : ''}" data-id="${esc(e.id)}" data-dir="up" title="Helpful">&#128077; <span>${v.up}</span></button>
          <button class="vote-btn ${v.myVote === 'down' ? 'voted' : ''}" data-id="${esc(e.id)}" data-dir="down" title="Not helpful">&#128078; <span>${v.down}</span></button>
        </div>
      </div>
    </div>`;
}

function renderMore() {
  document.title = 'More — LearnGameDev';

  const hubSections = Object.keys(TEXT_HUBS).map(key => {
    const meta = TOOL_META[key];
    const hubs = TEXT_HUBS[key].map(h => `
      <a class="resource-card" href="${esc(h.url)}" target="_blank" rel="noopener noreferrer">
        <span class="r-name">${esc(h.name)}</span>
        <span class="r-desc">${esc(h.desc)}</span>
      </a>`).join('');
    return `
      <div class="hub-tool-block">
        <h3>${meta.label}</h3>
        <div class="hub-list">${hubs}</div>
      </div>`;
  }).join('');

  const assetCards = ASSET_SITES.map(a => `
    <a class="resource-card" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer">
      <span class="r-name">${esc(a.name)}</span>
      <span class="r-desc">${esc(a.desc)}</span>
    </a>`).join('');

  const templateLabels = { godot: 'Godot', unity: 'Unity', unreal: 'Unreal', construct3: 'Construct 3', figma: 'Figma' };
  const templateSections = Object.keys(TEMPLATES).map(key => {
    const cards = TEMPLATES[key].map(t => `
      <a class="resource-card" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer">
        <span class="r-name">${esc(t.name)}</span>
        <span class="r-desc">${esc(t.desc)}</span>
      </a>`).join('');
    return `
      <div class="hub-tool-block">
        <h3>${templateLabels[key] || key}</h3>
        <div class="hub-list">${cards}</div>
      </div>`;
  }).join('');

  app.innerHTML = `
    <a href="#/" class="back-link">&larr; All tools</a>
    <div class="more-page">
      <h1>More</h1>
      <p class="lead">Text-based tutorial hubs for when video isn't your thing, free asset sites to actually build with, and a way to reach us.</p>

      <div class="more-section">
        <h2>Text-based tutorial hubs</h2>
        ${hubSections}
      </div>

      <div class="more-section">
        <h2>Free asset sites</h2>
        <div class="asset-grid">${assetCards}</div>
      </div>

      <div class="more-section">
        <h2>Free full-game templates</h2>
        <p class="lead" style="margin-bottom:20px;">Complete, CC0/free-to-use starter projects — not tutorials, actual downloadable projects you can build straight on top of.</p>
        ${templateSections}
      </div>

      <div class="more-section">
        <h2>Credits</h2>
        <div class="credits-box">
          <p>&copy; 2026 ST / LearnGameDev</p>
          <p>Every tutorial links directly to its original creator — full credit for the actual teaching belongs to them, not this site. This is a curation layer, not a replacement.</p>
        </div>
      </div>

      <div class="more-section">
        <h2>Feedback</h2>
        <div class="feedback-box">
          <input type="email" id="feedback-email" placeholder="Your email (optional)">
          <textarea id="feedback-text" placeholder="Found a dead link, a bad tutorial, or just have an idea? Say it here."></textarea>
          <button id="feedback-send">Send feedback</button>
          <p class="hint" id="feedback-hint"></p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('feedback-send').addEventListener('click', async () => {
    const email = document.getElementById('feedback-email').value.trim();
    const text = document.getElementById('feedback-text').value.trim();
    const hint = document.getElementById('feedback-hint');
    const btn = document.getElementById('feedback-send');
    if (!text) { document.getElementById('feedback-text').focus(); return; }

    btn.disabled = true;
    btn.textContent = 'Sending...';
    hint.textContent = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'LearnGameDev feedback',
          message: text,
          email: email || 'no-reply@learngamedev.com',
          from_name: email ? email : 'Anonymous visitor'
        })
      });
      const result = await res.json();
      if (result.success) {
        document.getElementById('feedback-text').value = '';
        document.getElementById('feedback-email').value = '';
        btn.textContent = 'Send feedback';
        hint.textContent = "Sent — thanks!";
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (err) {
      btn.textContent = 'Send feedback';
      hint.textContent = "Couldn't send that — try again in a moment.";
    }
    btn.disabled = false;
  });
}

function findEntryById(id) {
  for (const toolKey of Object.keys(DATA)) {
    const entries = allEntries(toolKey);
    const found = entries.find(e => e.id === id);
    if (found) return { ...found, toolKey, vote: getVoteState(found.id) };
  }
  return null;
}

function renderAccount() {
  const user = getCurrentUser();
  if (!user) { location.hash = '#/'; return; }
  document.title = 'My Account — LearnGameDev';

  const profile = getCurrentProfile();
  const savedEntries = getSavedIds().map(findEntryById).filter(Boolean);
  const completedEntries = getCompletedIds().map(findEntryById).filter(Boolean);

  app.innerHTML = `
    <a href="#/" class="back-link">&larr; All tools</a>
    <div class="account-page">
      <h1>${esc(profile ? profile.username : user.email)}</h1>
      <p class="lead">${completedEntries.length} tutorial${completedEntries.length === 1 ? '' : 's'} completed &middot; ${savedEntries.length} saved</p>

      <div class="more-section">
        <h2>Saved (${savedEntries.length})</h2>
        <div class="card-grid" id="saved-grid">${savedEntries.length ? savedEntries.map(cardHtml).join('') : '<p class="empty-state">Nothing saved yet — click Save on any tutorial card.</p>'}</div>
      </div>

      <div class="more-section">
        <h2>Completed (${completedEntries.length})</h2>
        <div class="card-grid" id="completed-grid">${completedEntries.length ? completedEntries.map(cardHtml).join('') : '<p class="empty-state">Nothing marked complete yet.</p>'}</div>
      </div>
    </div>
  `;

  app.querySelectorAll('.card-grid').forEach(grid => {
    grid.addEventListener('click', e => {
      const voteBtn = e.target.closest('.vote-btn');
      const saveBtn = e.target.closest('.save-btn');
      const completeBtn = e.target.closest('.complete-btn');
      if (voteBtn) { castVote(voteBtn.dataset.id, voteBtn.dataset.dir).then(() => renderAccount()); }
      if (saveBtn) { toggleSaved(saveBtn.dataset.id).then(() => renderAccount()); }
      if (completeBtn) { toggleCompleted(completeBtn.dataset.id).then(() => renderAccount()); }
    });
  });
}

function route() {
  const hash = location.hash.replace(/^#\/?/, '');
  toolNav.querySelectorAll('a').forEach(a => a.classList.toggle('active', a.dataset.tool === hash));
  const fab = document.querySelector('.more-fab');
  if (fab) fab.style.display = hash === 'more' ? 'none' : '';

  if (!hash) {
    renderHome();
    return;
  }
  if (hash === 'more') {
    renderMore();
    return;
  }
  if (hash === 'account') {
    renderAccount();
    return;
  }
  if (TOOL_META[hash]) {
    state.era = 'all';
    state.category = 'all';
    state.query = '';
    state.sort = 'default';
    state.userRecommended = false;
    state.verifiedOnly = false;
    renderTool(hash);
    return;
  }
  location.hash = '#/';
}

window.addEventListener('hashchange', route);

(async function init() {
  buildNav();
  await loadData();
  await initAuth();
  renderAccountArea();
  route();
})();
