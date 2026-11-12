// Shared motion helpers for the unfolding flow (transforms only, so older phones stay smooth).
// Every animation goes through play(), so a new navigation can cancel whatever is running.
import { el } from './dom.js';
import { motionOK } from './nib.js';

export { motionOK };
export const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
export const SOFT = 'cubic-bezier(.3,1.2,.5,1)'; // a gentler overshoot for big sheets

let live = [];
let layer = null;

export const rectOf = (node) => {
  const r = node.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

// Start an animation and remember it. Resolves true when it finishes, false if cancelled.
export function play(node, keyframes, opts) {
  if (!node || !node.animate) return Promise.resolve(false);
  const a = node.animate(keyframes, { fill: 'both', ...opts });
  live.push(a);
  return a.finished.then(() => true, () => false);
}

export const wait = (ms) => new Promise((done) => setTimeout(done, ms));

// Stop everything and remove the overlay. Elements fall back to their normal CSS,
// which is always the finished state, so cancelling mid-way never leaves a half-fold.
export function settle() {
  for (const a of live) { try { a.cancel(); } catch { /* already gone */ } }
  live = [];
  if (layer) { layer.remove(); layer = null; }
}

// Move the outgoing screen into a fixed layer exactly where it was, so it can keep animating
// while the next screen is already in place underneath (or on top, via z).
export function lift(screen, z = 1) {
  const r = rectOf(screen);
  layer = el('div', { class: 'overlay', style: `z-index:${z}` });
  screen.style.cssText += `;position:fixed;left:${r.x}px;top:${r.y}px;width:${r.w}px;margin:0;animation:none`;
  layer.append(screen);
  document.body.append(layer);
  void layer.offsetHeight; // flush styles so class changes on the lifted screen still transition
  return layer;
}

export const addToLayer = (node) => { layer.append(node); return node; };

// A transform (origin: top centre) that makes an element laid out as rect F look like rect R.
// `tilt` leans the top-hinged element back, as paper does half way through a fold.
export function pose(F, R, tilt = 0) {
  const dx = R.x + R.w / 2 - (F.x + F.w / 2), dy = R.y - F.y;
  const sx = Math.max(R.w / F.w, 0.001), sy = Math.max(R.h / F.h, 0.001);
  return `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) perspective(900px) rotateX(${tilt}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
}

const lerp = (a, b, t) => a + (b - a) * t;

// Keyframes that take an element from the small rect T up to its real rect F in three folds:
// widen, lean open, lie flat. Pass reverse = true to fold it back down.
export function threeFolds(F, T, reverse = false) {
  const r1 = { x: F.x, w: F.w, y: T.y, h: Math.max(T.h, 36) };
  const r2 = { x: F.x, w: F.w, y: lerp(T.y, F.y, .6), h: lerp(r1.h, F.h, .5) };
  const frames = [
    { transform: pose(F, T), offset: 0, easing: SOFT },
    { transform: pose(F, r1), offset: .28, easing: SOFT },
    { transform: pose(F, r2, -28), offset: .62, easing: SOFT },
    { transform: pose(F, F), offset: 1 },
  ];
  if (!reverse) return frames;
  return frames.reverse().map((f, i) => ({ ...f, offset: [0, .38, .72, 1][i] }));
}

// The coloured paper that covers a sheet or page while it is still folding, then flaps up
// (or back down) to show the face. Lives inside the element; created by the caller.
export const coverFlap = (cover, open, opts) => play(cover, open
  ? [{ transform: 'perspective(700px) rotateX(0deg)' }, { transform: 'perspective(700px) rotateX(-100deg)' }]
  : [{ transform: 'perspective(700px) rotateX(-100deg)' }, { transform: 'perspective(700px) rotateX(0deg)' }],
{ duration: 260, easing: 'ease-in-out', ...opts });

export const makeCover = () => el('div', { class: 'cover', 'aria-hidden': 'true' });
