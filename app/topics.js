// The topics sheet: a paper page with a dashed fold line winding down it. Each topic stands
// up along the line as a pop-up tab, and Nib walks the line to whichever tab you tap.
// Layout: x is a percentage of the sheet width, y is in px, so it fits any phone.
import { el, svg } from './dom.js';
import { loadTopic } from './content.js';
import { hasStar } from './progress.js';
import { nibArt, hop } from './nib.js';
import { play, rectOf, threeFolds, makeCover, coverFlap, SPRING } from './fx.js';

const ROW = 96, TOP = 70, TAB_W = 44, WALKER = 64, SIDE = 34;
const FLAT = 'perspective(500px) rotateX(-90deg) scaleY(.3)'; // a tab laid flat on the sheet
const lerp = (a, b, t) => a + (b - a) * t;

// Anchor 0 is the sheet's top-left corner (where Nib waits); anchor i+1 is row i.
// Even rows have the line on the left of their tab, odd rows on the right; Nib stands on the free side.
function anchorsFor(n) {
  const a = [{ x: 11, y: 36, off: 0 }];
  for (let i = 0; i < n; i++) a.push({ x: i % 2 ? 58 : 42, y: TOP + i * ROW, off: i % 2 ? SIDE : -SIDE });
  return a;
}

// Point on the line between anchors A and B at t (0..1): a smooth S-curve with vertical ends.
function curve(A, B, t, w) {
  const u = 1 - t, ym = (A.y + B.y) / 2, s = t * t * (3 - 2 * t);
  const x = u * u * u * A.x + 3 * u * u * t * A.x + 3 * u * t * t * B.x + t * t * t * B.x;
  const y = u * u * u * A.y + 3 * u * u * t * ym + 3 * u * t * t * ym + t * t * t * B.y;
  return { x: x * w / 100 + lerp(A.off, B.off, s), y };
}

// `rest` is the row Nib stands at (-1 = the corner). Titles are loaded first so tabs are sized once.
export async function buildTopics(track, { onOpen, rest = -1 }) {
  const ids = track.topics, n = ids.length;
  const titles = await Promise.all(ids.map((id) => loadTopic(id).then((t) => t.title).catch(() => id)));
  const anchors = anchorsFor(n);
  const H = TOP + (n - 1) * ROW + 74;
  let at = rest + 1; // current anchor index of Nib

  const d = anchors.slice(1).reduce((p, b, i) => {
    const a = anchors[i], ym = (a.y + b.y) / 2;
    return `${p} C${a.x} ${ym} ${b.x} ${ym} ${b.x} ${b.y}`;
  }, `M${anchors[0].x} ${anchors[0].y}`);
  const line = svg('svg', { class: 'line', viewBox: `0 0 100 ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true' },
    svg('path', { d, class: 'crease' }));

  const tabs = ids.map((id, i) => {
    const left = i % 2 === 1; // odd rows: tab on the left of the line
    const star = hasStar(id) ? el('span', { class: 'star', 'aria-label': 'Star earned' }, '★') : null;
    const btn = el('button', { class: `tab popup track-${track.id}`, onclick: () => onOpen(id, i) }, titles[i], ...(star ? [' ', star] : []));
    return { id, btn, slot: el('div', { class: `slot ${left ? 'l' : 'r'}`, style: `top:${TOP + i * ROW}px;width:${TAB_W}%` }, btn) };
  });

  const cover = makeCover();
  const art = nibArt();
  const walker = el('div', { class: 'walker' }, svg('svg', { viewBox: '-100 -100 200 200', width: WALKER, height: WALKER, 'aria-hidden': 'true' }, art));
  const sheet = el('div', { class: `sheet t${track.id}`, style: `height:${H}px` }, line, ...tabs.map((t) => t.slot), walker, cover);

  const put = (i) => {
    at = i;
    const a = anchors[i];
    walker.style.left = `calc(${a.x}% + ${a.off}px)`;
    walker.style.top = `${a.y}px`;
  };
  put(at);

  // Nib walks the line to row i (hopping as it goes), then does a small hop. Resolves false if interrupted.
  async function walkTo(i) {
    const target = i + 1;
    if (target === at) return true;
    const w = sheet.clientWidth, dir = target > at ? 1 : -1, STEPS = 10;
    const pts = [];
    for (let k = at; k !== target; k += dir) {
      for (let s = pts.length ? 1 : 0; s <= STEPS; s++) pts.push(curve(anchors[k], anchors[k + dir], s / STEPS, w));
    }
    let len = 0;
    for (let k = 1; k < pts.length; k++) len += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y);
    const hops = Math.max(2, Math.round(len / 46));
    const end = pts[pts.length - 1];
    put(target); // already at the destination; the animation starts from where Nib was
    const frames = pts.map((p, k) => ({
      transform: `translate(${(p.x - end.x).toFixed(1)}px,${(p.y - end.y - Math.abs(Math.sin(k / (pts.length - 1) * hops * Math.PI)) * 8).toFixed(1)}px)`,
      offset: k / (pts.length - 1),
    }));
    const ok = await play(walker, frames, { duration: Math.min(750, 300 + len * 1.1), easing: 'ease-in-out', fill: 'backwards' });
    if (ok) hop(art);
    return ok;
  }

  const hideUntil = (node, ms) => play(node, [
    { visibility: 'hidden', offset: 0 }, { visibility: 'hidden', offset: .999 }, { visibility: 'visible', offset: 1 },
  ], { duration: Math.max(ms, 1) });

  return {
    sheet, walker, tabs, art,
    rowOf: (id) => ids.indexOf(id),
    tabRect: (i) => rectOf(tabs[i].btn),
    walkerRect: () => rectOf(walker),
    walkTo, hideUntil,

    // Tabs stand up one after another, like pop-up paper.
    popIn({ at = 0, gap = 100, dur = 380 } = {}) {
      return Promise.all(tabs.map((t, i) => play(t.btn, [{ transform: FLAT }, { transform: 'none' }],
        { duration: dur, delay: at + i * gap, easing: SPRING })));
    },
    // Tabs lie flat again (the one at `keep` stays up).
    foldTabs({ at = 0, gap = 45, dur = 200, keep = -1 } = {}) {
      return Promise.all(tabs.map((t, i) => (i === keep ? null
        : play(t.btn, [{ transform: 'none' }, { transform: FLAT }], { duration: dur, delay: at + (n - 1 - i) * gap, easing: 'ease-in' }))));
    },
    // The sheet opens from a small rect into its full size in three folds, then its cover flaps up.
    unfold(from, { at = 0, dur = 700 } = {}) {
      const F = rectOf(sheet);
      const grow = play(sheet, threeFolds(F, from), { duration: dur, delay: at });
      hideUntil(sheet, at);
      coverFlap(cover, true, { delay: at + dur * .62 });
      return grow;
    },
    // The reverse: the cover drops back, then the sheet folds down into the small rect.
    fold(to, { at = 0, dur = 650 } = {}) {
      const F = rectOf(sheet);
      coverFlap(cover, false, { delay: at });
      return play(sheet, threeFolds(F, to, true), { duration: dur, delay: at + 180 });
    },
    hideTab: (i, on) => { tabs[i].btn.style.visibility = on ? 'hidden' : ''; },
  };
}
