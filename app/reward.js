// The star reward: a paper star pops up on the page, then flies to the star beside the heading.
// Only transforms and opacity are animated. With "reduce motion" on, the star just appears.
import { el, svg } from './dom.js';
import { play, rectOf, motionOK, SPRING } from './fx.js';

// A five-pointed paper star in two tones: lit on the left half, shaded on the right half.
function paperStar(size) {
  const pts = [];
  for (let k = 0; k < 10; k++) {
    const a = (-90 + 36 * k) * Math.PI / 180, r = k % 2 ? 17 : 40;
    pts.push([+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)]);
  }
  const poly = (list, fill) => svg('polygon', { points: list.map((p) => p.join(',')).join(' '), fill });
  return svg('svg', { viewBox: '-44 -44 88 88', width: size, height: size, 'aria-hidden': 'true' },
    poly(pts.slice(5).concat([pts[0]]), '#f6c23e'),
    poly(pts.slice(0, 6), '#dfa920'));
}

const SIZE = 96;

// `from` is the element to burst from (the page), `target` the small star to land on.
export async function starReward(from, target) {
  if (!motionOK()) { target.hidden = false; return; }
  target.style.visibility = 'hidden';
  target.hidden = false;
  const a = rectOf(from), b = rectOf(target);
  const node = el('div', { class: 'reward', style: `left:${a.x + a.w / 2 - SIZE / 2}px;top:${a.y + Math.min(a.h / 2, 160) - SIZE / 2}px;width:${SIZE}px;height:${SIZE}px` }, paperStar(SIZE));
  document.body.append(node);
  const dx = b.x + b.w / 2 - (a.x + a.w / 2), dy = b.y + b.h / 2 - (a.y + Math.min(a.h / 2, 160));
  const s = Math.max(b.w, 14) / SIZE;
  await play(node, [
    { transform: 'scale(0) rotate(-60deg)', opacity: 1, easing: SPRING },
    { transform: 'scale(1.15) rotate(8deg)', offset: .34, easing: 'ease-out' },
    { transform: 'scale(1) rotate(0deg)', offset: .44 },
    { transform: 'scale(1) rotate(0deg)', offset: .66, easing: 'ease-in-out' },
    { transform: `translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(${s.toFixed(3)}) rotate(360deg)`, opacity: 1 },
  ], { duration: 1500 });
  node.remove();
  target.style.visibility = '';
  play(target, [{ transform: 'scale(1.8)' }, { transform: 'scale(1)' }], { duration: 360, easing: SPRING, fill: 'none' });
}
