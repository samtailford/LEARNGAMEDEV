// Vote storage layer. Currently backed by localStorage (per-browser only).
// NOTE: to make votes genuinely shared across all visitors, swap the body of
// these three functions for calls to a real backend (e.g. Vercel KV / a small
// serverless API) once the site is deployed — the rest of the app only talks
// to this module, so nothing else needs to change.

const VOTES_KEY = 'lgd_votes_v1';       // { [entryId]: { up: number, down: number } }
const MY_VOTES_KEY = 'lgd_my_votes_v1'; // { [entryId]: 'up' | 'down' }

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function getAllVotes() {
  return readJSON(VOTES_KEY, {});
}

function getMyVotes() {
  return readJSON(MY_VOTES_KEY, {});
}

// Returns { up, down, score, myVote } for one entry.
function getVoteState(entryId) {
  const all = getAllVotes();
  const mine = getMyVotes();
  const rec = all[entryId] || { up: 0, down: 0 };
  return { up: rec.up, down: rec.down, score: rec.up - rec.down, myVote: mine[entryId] || null };
}

// Casts or toggles a vote. Clicking the same direction again removes it.
function castVote(entryId, direction) {
  const all = getAllVotes();
  const mine = getMyVotes();
  const rec = all[entryId] || { up: 0, down: 0 };
  const prev = mine[entryId] || null;

  if (prev) rec[prev] = Math.max(0, rec[prev] - 1);

  if (prev === direction) {
    delete mine[entryId];
  } else {
    rec[direction] = (rec[direction] || 0) + 1;
    mine[entryId] = direction;
  }

  all[entryId] = rec;
  writeJSON(VOTES_KEY, all);
  writeJSON(MY_VOTES_KEY, mine);
  return getVoteState(entryId);
}
