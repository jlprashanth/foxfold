// The six track shapes, drawn in an 80x80 box and centred on (0,0).
// Colours come from CSS (classes c1..c4 per track), so art holds no colour values.
// Facets use hard-edged darker tones, like folded paper.
import { svg } from './dom.js';

const poly = (pts, cls) => svg('polygon', { points: pts, class: cls });

const boat = () => [
  poly('40,10 40,50 14,50', 'c1'), poly('44,22 44,50 68,50', 'c2'),
  poly('8,54 72,54 60,70 20,70', 'c3'), poly('8,54 40,54 40,70 20,70', 'c2'),
];
const house = () => [
  poly('14,40 66,40 66,70 14,70', 'c1'),
  poly('8,42 40,12 40,42', 'c2'), poly('72,42 40,12 40,42', 'c3'),
  poly('33,50 47,50 47,70 33,70', 'c4'),
];
const plane = () => [
  poly('6,16 74,38 28,38', 'c1'), poly('6,60 74,38 28,38', 'c2'),
  poly('28,38 74,38 18,50', 'c3'), poly('6,16 28,38 6,38', 'c3'),
];
const pinwheel = () => [
  poly('38,44 42,44 40,78', 'c3'),
  poly('40,40 8,8 40,8', 'c1'), poly('40,40 72,8 72,40', 'c2'),
  poly('40,40 72,72 40,72', 'c1'), poly('40,40 8,72 8,40', 'c2'),
  poly('36,36 44,36 44,44 36,44', 'c3'),
];
const lantern = () => [
  poly('28,6 52,6 54,14 26,14', 'c3'),
  poly('26,14 54,14 56,24 24,24', 'c3'),
  poly('24,24 40,24 40,64 24,64 16,44', 'c1'), poly('40,24 56,24 64,44 56,64 40,64', 'c2'),
  poly('33,36 47,36 47,54 33,54', 'c4'),
  poly('26,64 54,64 48,74 32,74', 'c3'),
];
function star() {
  const cx = 40, cy = 42, R = 36, r = 15;
  const at = (rad, deg) => [cx + rad * Math.cos(deg * Math.PI / 180), cy + rad * Math.sin(deg * Math.PI / 180)];
  const out = [0, 1, 2, 3, 4].map((k) => at(R, -90 + 72 * k));
  const inn = [0, 1, 2, 3, 4].map((k) => at(r, -54 + 72 * k)); // inn[k] sits between out[k] and out[k+1]
  const pt = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const out2 = [];
  for (let k = 0; k < 5; k++) {
    const next = out[(k + 1) % 5], prevInn = inn[(k + 4) % 5];
    out2.push(poly(`${pt([cx, cy])} ${pt(out[k])} ${pt(inn[k])}`, 'c1'));
    out2.push(poly(`${pt([cx, cy])} ${pt(inn[k])} ${pt(next)}`, 'c2'));
    out2.push(poly(`${pt(out[k])} ${pt(lerp(out[k], prevInn, .4))} ${pt(lerp(out[k], inn[k], .4))}`, 'c4')); // silver tip
  }
  return out2;
}
const ART = { 1: boat, 2: house, 3: plane, 4: pinwheel, 5: lantern, 6: star };

// A track with no topics yet shows as a plain unfolded sheet: creases visible, a corner
// in the track colour, and "coming soon" written on it.
const unfolded = () => [
  poly('10,10 70,10 70,70 10,70', 'sheet'),
  svg('path', { d: 'M10 10 L70 70 M70 10 L10 70 M40 10 L40 70 M10 40 L70 40', class: 'crease' }),
  poly('52,10 70,10 70,28', 'c1'),
  svg('text', { class: 'small', x: 38, y: 37, 'text-anchor': 'middle' }, 'coming'),
  svg('text', { class: 'small', x: 38, y: 52, 'text-anchor': 'middle' }, 'soon'),
];

export function shapeArt(id, ready) {
  const parts = ready ? (ART[id] || unfolded)() : unfolded();
  return svg('g', { class: `art t${id}` }, svg('g', { transform: 'translate(-40 -40)' }, ...parts));
}
