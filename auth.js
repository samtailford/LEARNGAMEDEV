// Account system: auth, saved tutorials, completed tutorials.
// Backed by Supabase. All calls go through this module so the rest of the
// app never talks to Supabase directly.

const SUPABASE_URL = "https://uewprtwgaprvsxqzbjfj.supabase.co";
const SUPABASE_KEY = "sb_publishable_WUKDgh-v1VsHo5qzZOuD0g_y6W0k8Ry";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// In-memory cache of the current user's saved/completed tutorial ids, so the
// UI can render synchronously without an async round-trip on every card.
let currentUser = null;
let currentProfile = null;
let savedSet = new Set();
let completedSet = new Set();
let voteCounts = new Map();  // tutorial_id -> {up, down} — public, loaded for everyone
let myVotes = new Map();     // tutorial_id -> 'up' | 'down' — only when signed in
let authReadyResolve;
const authReady = new Promise(res => { authReadyResolve = res; });

async function initAuth() {
  await loadVoteCounts();
  const { data: { session } } = await sb.auth.getSession();
  await handleSession(session);
  authReadyResolve();

  sb.auth.onAuthStateChange(async (_event, session) => {
    await handleSession(session);
    if (typeof onAuthChange === 'function') onAuthChange();
  });
}

async function handleSession(session) {
  currentUser = session ? session.user : null;
  if (!currentUser) {
    currentProfile = null;
    savedSet = new Set();
    completedSet = new Set();
    myVotes = new Map();
    return;
  }
  await Promise.all([loadProfile(), loadSavedAndCompleted(), loadMyVotes()]);
}

async function loadVoteCounts() {
  const { data } = await sb.from('vote_counts').select('*');
  voteCounts = new Map((data || []).map(r => [r.tutorial_id, { up: r.up, down: r.down }]));
}

async function loadMyVotes() {
  const { data } = await sb.from('votes').select('tutorial_id, direction').eq('user_id', currentUser.id);
  myVotes = new Map((data || []).map(r => [r.tutorial_id, r.direction]));
}

async function loadProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).maybeSingle();
  currentProfile = data || null;
}

async function loadSavedAndCompleted() {
  const [savedRes, completedRes] = await Promise.all([
    sb.from('saved_tutorials').select('tutorial_id').eq('user_id', currentUser.id),
    sb.from('completed_tutorials').select('tutorial_id').eq('user_id', currentUser.id)
  ]);
  savedSet = new Set((savedRes.data || []).map(r => r.tutorial_id));
  completedSet = new Set((completedRes.data || []).map(r => r.tutorial_id));
}

function getCurrentUser() { return currentUser; }
function getCurrentProfile() { return currentProfile; }
function isSaved(tutorialId) { return savedSet.has(tutorialId); }
function isCompleted(tutorialId) { return completedSet.has(tutorialId); }

async function signUp(email, password, username) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
  if (error) return { error };
  // If email confirmation is required, Supabase returns a user but no
  // session yet — the profile row is still created by a DB trigger.
  return { data, needsEmailConfirm: !data.session };
}

async function signIn(email, password) {
  return sb.auth.signInWithPassword({ email, password });
}

async function signOut() {
  return sb.auth.signOut();
}

async function toggleSaved(tutorialId) {
  if (!currentUser) return { error: 'not-signed-in' };
  if (savedSet.has(tutorialId)) {
    await sb.from('saved_tutorials').delete().eq('user_id', currentUser.id).eq('tutorial_id', tutorialId);
    savedSet.delete(tutorialId);
  } else {
    await sb.from('saved_tutorials').insert({ user_id: currentUser.id, tutorial_id: tutorialId });
    savedSet.add(tutorialId);
  }
  return { saved: savedSet.has(tutorialId) };
}

async function toggleCompleted(tutorialId) {
  if (!currentUser) return { error: 'not-signed-in' };
  if (completedSet.has(tutorialId)) {
    await sb.from('completed_tutorials').delete().eq('user_id', currentUser.id).eq('tutorial_id', tutorialId);
    completedSet.delete(tutorialId);
  } else {
    await sb.from('completed_tutorials').insert({ user_id: currentUser.id, tutorial_id: tutorialId });
    completedSet.add(tutorialId);
  }
  return { completed: completedSet.has(tutorialId) };
}

function getSavedIds() { return Array.from(savedSet); }
function getCompletedIds() { return Array.from(completedSet); }

// Returns { up, down, score, myVote } for one entry — same shape the UI
// already expects, now backed by Supabase instead of localStorage.
function getVoteState(tutorialId) {
  const counts = voteCounts.get(tutorialId) || { up: 0, down: 0 };
  const mine = myVotes.get(tutorialId) || null;
  return { up: counts.up, down: counts.down, score: counts.up - counts.down, myVote: mine };
}

// Casts or toggles a vote. Requires being signed in. Clicking the same
// direction again removes it; clicking the other direction switches it.
async function castVote(tutorialId, direction) {
  if (!currentUser) return { error: 'not-signed-in' };

  const counts = voteCounts.get(tutorialId) || { up: 0, down: 0 };
  const prev = myVotes.get(tutorialId) || null;

  if (prev) {
    await sb.from('votes').delete().eq('user_id', currentUser.id).eq('tutorial_id', tutorialId);
    counts[prev] = Math.max(0, counts[prev] - 1);
  }

  if (prev === direction) {
    myVotes.delete(tutorialId);
  } else {
    await sb.from('votes').insert({ user_id: currentUser.id, tutorial_id: tutorialId, direction });
    counts[direction] = (counts[direction] || 0) + 1;
    myVotes.set(tutorialId, direction);
  }

  voteCounts.set(tutorialId, counts);
  return getVoteState(tutorialId);
}
