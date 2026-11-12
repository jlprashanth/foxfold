// Saved progress: the topics whose mini-game was finished (a paper star each).
// localStorage can be blocked or throw (private mode), so every access is guarded.
const KEY = 'foxfold-stars';

export function getStars() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export const hasStar = (id) => getStars().includes(id);

export function addStar(id) {
  const stars = getStars();
  if (stars.includes(id)) return;
  try { localStorage.setItem(KEY, JSON.stringify([...stars, id])); } catch { /* progress just won't persist */ }
}
