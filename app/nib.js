// Nib, the origami fox: ~14 flat SVG triangles plus small motion helpers.
// Art is drawn in a 200x200 box. Only transforms are animated (cheap on old phones).
// Each moving job has its own wrapper group so animations never overwrite each other:
//   fu-*  = fold-up on first visit      nib-hop  = hop on tap
//   nib-tilt = head tilt on tap         nib-fan  = tail fan on tap
//   nib-tail / nib-head / nib-ear / nib-eye = idle loops (CSS)
import { svg } from './dom.js';

const SPRING = 'cubic-bezier(.34,1.56,.64,1)';
export const motionOK = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

const poly = (pts, cls) => svg('polygon', { points: pts, class: cls });
const mirror = (pts) => pts.split(' ').map((p) => { const [x, y] = p.split(','); return `${+(200 - x).toFixed(1)},${y}`; }).join(' ');

// Art centre, so the group can be placed by its middle.
export const NIB_CENTRE = { x: 118, y: 113 };
// Tail tip, where the track strips leave from.
export const NIB_TAIL_TIP = { x: 194, y: 118 };

export function nibArt() {
  const earOuter = '48,88 98,70 44,26';
  const earInner = '58,78 86,72 50,46';
  const earTip = '44,26 45.3,45.8 61.3,40';
  const ears = svg('g', { class: 'fu-ears' },
    svg('g', { class: 'nib-ear nib-ear-l' }, poly(earOuter, 'n1'), poly(earInner, 'n3'), poly(earTip, 'nw')),
    svg('g', { class: 'nib-ear nib-ear-r' }, poly(mirror(earOuter), 'n2'), poly(mirror(earInner), 'n3'), poly(mirror(earTip), 'nw2')));

  const head = svg('g', { class: 'fu-head' },
    svg('g', { class: 'nib-tilt' },
      svg('g', { class: 'nib-head' },
        ears,
        poly('100,70 48,88 100,150', 'n1'), poly('100,70 152,88 100,150', 'n2'),
        poly('68,112 100,112 100,150', 'nw'), poly('100,112 132,112 100,150', 'nw2'),
        svg('g', { class: 'nib-eyes' },
          svg('rect', { class: 'nib-eye ink', x: 73, y: 96, width: 9, height: 12 }),
          svg('rect', { class: 'nib-eye ink', x: 118, y: 96, width: 9, height: 12 })),
        poly('93,141 107,141 100,152', 'ink'))));

  const body = svg('g', { class: 'fu-body' },
    poly('100,118 54,196 100,196', 'n1'), poly('100,118 146,196 100,196', 'n2'),
    poly('100,132 80,176 100,196', 'nw'), poly('100,132 120,176 100,196', 'nw2'));

  const tail = svg('g', { class: 'fu-tail' },
    svg('g', { class: 'nib-fan' },
      svg('g', { class: 'nib-tail' },
        poly('132,194 148,160 194,118', 'n1'), poly('132,194 194,118 178,182', 'n2'),
        poly('194,118 177.9,132.7 188.4,140.4', 'nw'))));

  const hop = svg('g', { class: 'nib-hop' }, poly('50,198 156,198 176,206 70,206', 'shadow'), tail, body, head);
  return svg('g', { class: 'nib', transform: `translate(${-NIB_CENTRE.x} ${-NIB_CENTRE.y})` }, hop);
}

function run(node, keys, opts, origin) {
  if (!node || !node.animate) return null;
  if (origin) node.style.transformOrigin = origin;
  return node.animate(keys, opts);
}

// Springy hop with a little squash and stretch.
export function hop(g) {
  if (!motionOK()) return;
  run(g.querySelector('.nib-hop'), [
    { transform: 'translateY(0) scale(1,1)', easing: 'ease-out' },
    { transform: 'translateY(3px) scale(1.07,.9)', offset: .14, easing: 'ease-out' },
    { transform: 'translateY(-34px) scale(.95,1.08)', offset: .45, easing: 'ease-in' },
    { transform: 'translateY(0) scale(1.08,.9)', offset: .72, easing: 'ease-out' },
    { transform: 'translateY(-6px) scale(.98,1.02)', offset: .86, easing: 'ease-in' },
    { transform: 'translateY(0) scale(1,1)' },
  ], { duration: 620 }, '118px 196px');
}

// Head tilt (dir -1 = left, 1 = right).
export function tilt(g, dir = -1) {
  if (!motionOK()) return;
  run(g.querySelector('.nib-tilt'), [
    { transform: 'rotate(0deg)' },
    { transform: `rotate(${14 * dir}deg)`, offset: .3 },
    { transform: `rotate(${-5 * dir}deg)`, offset: .62 },
    { transform: 'rotate(0deg)' },
  ], { duration: 700, easing: 'ease-in-out' }, '100px 150px');
}

// Two quick nods: a right answer.
export function nod(g) {
  if (!motionOK()) return;
  run(g.querySelector('.nib-tilt'), [
    { transform: 'translateY(0) rotate(0deg)' },
    { transform: 'translateY(7px) rotate(4deg)', offset: .22 },
    { transform: 'translateY(0) rotate(0deg)', offset: .45 },
    { transform: 'translateY(6px) rotate(-3deg)', offset: .68 },
    { transform: 'translateY(0) rotate(0deg)' },
  ], { duration: 620, easing: 'ease-in-out' }, '100px 150px');
}

// Tail flares out, as if releasing the paper strips.
export function fanTail(g) {
  if (!motionOK()) return;
  run(g.querySelector('.nib-fan'), [
    { transform: 'rotate(0deg) scale(1)' },
    { transform: 'rotate(-26deg) scale(1.18)', offset: .3 },
    { transform: 'rotate(12deg) scale(1.1)', offset: .65 },
    { transform: 'rotate(0deg) scale(1)' },
  ], { duration: 700, easing: 'ease-in-out' }, '132px 192px');
}

// First visit: a flat paper square folds itself up into Nib in about 2 seconds.
export function foldUp(g) {
  const hopEl = g.querySelector('.nib-hop');
  if (!motionOK() || !hopEl.animate) {
    run(hopEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    return Promise.resolve();
  }
  const sheet = svg('g', { class: 'nib-sheet' }, poly('100,56 172,128 100,200 28,128', 'n1'), poly('100,56 172,128 100,200', 'n2'),
    svg('path', { d: 'M100 56 L100 200 M28 128 L172 128', class: 'crease' }));
  hopEl.prepend(sheet);
  const part = (sel, origin, from, delay, duration) =>
    run(g.querySelector(sel), [{ transform: from }, { transform: 'none' }], { duration, delay, easing: SPRING, fill: 'backwards' }, origin);

  part('.fu-body', '100px 196px', 'scaleY(0)', 350, 520);
  part('.fu-head', '100px 150px', 'scale(.05) rotate(-40deg)', 750, 520);
  part('.fu-ears', '100px 80px', 'scaleY(0)', 1150, 400);
  part('.fu-tail', '132px 192px', 'rotate(-70deg) scale(.1)', 1350, 480);
  const gone = run(sheet, [
    { transform: 'scale(.2)', easing: SPRING },
    { transform: 'scale(1)', offset: .22 },
    { transform: 'scale(1)', offset: .5 },
    { transform: 'scaleY(0)' },
  ], { duration: 1000, fill: 'forwards' }, '100px 200px');
  gone.finished.then(() => sheet.remove()).catch(() => sheet.remove());
  return new Promise((done) => setTimeout(() => { hop(g); done(); }, 1850));
}
