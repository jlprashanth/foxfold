// Saved progress: the topics whose mini-game was finished (a paper star each).
// localStorage can be blocked or throw (private mode), so every access is guarded.
const KEY = 'foxfold-stars';

export function getStars() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

// First-visit intro (Nib folds up from a square). Remembered in memory too, so a
// blocked localStorage still plays it only once per session.
let introThisSession = false;
export function takeIntro() {
  if (introThisSession) return false;
  introThisSession = true;
  try {
    if (localStorage.getItem('foxfold-intro')) return false;
    localStorage.setItem('foxfold-intro', '1');
  } catch { /* blocked: fall through and play it once */ }
  return true;
}

export const hasStar = (id) => getStars().includes(id);

export function addStar(id) {
  const stars = getStars();
  if (stars.includes(id)) return;
  try { localStorage.setItem(KEY, JSON.stringify([...stars, id])); } catch { /* progress just won't persist */ }
}
