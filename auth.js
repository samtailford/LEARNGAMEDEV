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
let authReadyResolve;
const authReady = new Promise(res => { authReadyResolve = res; });

async function initAuth() {
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
    return;
  }
  await Promise.all([loadProfile(), loadSavedAndCompleted()]);
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
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { error };
  if (data.user) {
    const { error: profileError } = await sb.from('profiles').insert({ id: data.user.id, username });
    if (profileError) return { error: profileError };
  }
  return { data };
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
