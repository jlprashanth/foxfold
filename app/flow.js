// The four unfolding moves between Tracks, Topics and a topic page. Each one runs while the
// outgoing screen sits in a fixed overlay and the incoming screen is already in place, so both
// can animate at once. Times are in ms. Every move can be interrupted: main.js calls settle().
//
//   openTrack   shape glides to the centre and unfolds into the topics sheet; tabs pop up
//   closeTrack  tabs lie flat, the sheet folds back into its shape, the other shapes open
//   openTopic   the tapped tab unfolds, in three folds, into the page
//   closeTopic  the page folds back down into its tab while the sheet opens behind it
//
// ctx = { from: {screen, stage, ctl, page}, to: {screen, stage, ctl, page}, state, prev, install, alive }
import { svg, el } from './dom.js';
import { shapeArt } from './shapes.js';
import { play, rectOf, lift, addToLayer, addOnTop, settle, wait, coverFlap, threeFolds, SPRING, SOFT } from './fx.js';

const FLAT_Y = [{ transform: 'none' }, { transform: 'scaleY(0)' }];
const OPEN_Y = [{ transform: 'scaleY(0)' }, { transform: 'none' }];

// A bar of the screen (heading row, nav) folds flat toward its top edge, or stands back up.
const foldOut = (node, at = 0, dur = 200) => play(node, FLAT_Y, { duration: dur, delay: at, easing: 'ease-in' });
const foldIn = (node, at = 0, dur = 320) => play(node, OPEN_Y, { duration: dur, delay: at, easing: SPRING });

// A loose copy of a track's paper shape, positioned over a viewport rect.
function ghostShape(trackId, r) {
  const node = el('div', { class: 'ghost', style: `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px` },
    svg('svg', { viewBox: '-40 -40 80 80', width: '100%', height: '100%', 'aria-hidden': 'true' }, shapeArt(trackId, true)));
  return addToLayer(node);
}

// A loose copy of a topic tab, label and all, over its viewport rect. The page's cover has no label,
// so this copy fades in (or out) on top while the page is the size of the tab. Without it the label
// would pop in or out at the end of the fold.
function ghostTab(btn, r) {
  const node = btn.cloneNode(true);
  node.removeAttribute('style');
  node.setAttribute('aria-hidden', 'true');
  node.tabIndex = -1;
  node.classList.add('ghost');
  node.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px;margin:0`;
  return addOnTop(node);
}

const q = (screen, sel) => screen.querySelector(sel);
const finish = async (ctx, ms, done) => { await wait(ms); if (ctx.alive()) { done?.(); settle(); } };

export async function openTrack(ctx) {
  const { from, to, state } = ctx, id = state.track;
  const shape = from.stage.shapeRect(id);
  const oldHead = q(from.screen, '.stage-head');
  lift(from.screen, 3);
  ctx.install();

  // Where things must end up, measured before any animation moves them.
  const F = rectOf(to.ctl.sheet);
  const nibTarget = to.ctl.walkerRect();
  const size = 112, cx = F.x + F.w / 2, cy = F.y + Math.min(F.h / 2, 150);
  const G = { x: cx - size / 2, y: cy - size / 2, w: size, h: size };

  // 0-420: the other shapes fold flat, the chosen one glides to the middle, Nib shrinks to the corner.
  from.stage.away(id);
  foldOut(oldHead);
  const ghost = ghostShape(id, shape);
  ghost.style.transformOrigin = '0 0';
  const ghostEnd = `translate(${(G.x - shape.x).toFixed(1)}px,${(G.y - shape.y).toFixed(1)}px) scale(${size / shape.w})`;
  play(ghost, [{ transform: 'none' }, { transform: ghostEnd }], { duration: 420, easing: SOFT });
  from.stage.nibTo(nibTarget, { duration: 520, delay: 60, easing: SPRING }).then(() => from.stage.hideNib());
  to.ctl.hideUntil(to.ctl.walker, 580);

  // 400-1100: the shape opens into the sheet; its copy folds flat on top.
  play(ghost, [{ transform: ghostEnd }, { transform: `${ghostEnd} scaleY(0)` }], { duration: 220, delay: 400, easing: 'ease-in' });
  to.ctl.unfold(G, { at: 400, dur: 700 });
  foldIn(q(to.screen, '.stage-head'), 460);

  // 930-: the tabs stand up one after another.
  const gap = 85;
  to.ctl.popIn({ at: 930, gap, dur: 340 });
  await finish(ctx, 930 + gap * 5 + 400);
}

export async function closeTrack(ctx) {
  const { from, to, prev } = ctx, id = prev.track;
  const walkerR = from.ctl.walkerRect();
  const oldHead = q(from.screen, '.stage-head');
  lift(from.screen, 3);
  ctx.install();
  from.ctl.walker.style.visibility = 'hidden';

  const target = to.stage.shapeRect(id);
  foldIn(q(to.screen, '.stage-head'), 100);

  // 0-400: tabs lie flat, the heading folds, Nib hurries back to the middle of the stage.
  from.ctl.foldTabs({ gap: 40, dur: 180 });
  foldOut(oldHead);
  to.stage.nibFrom(walkerR, { duration: 520, easing: SPRING });
  // 200-1000: the sheet folds down into a small square over its shape; the other shapes open.
  from.ctl.fold(target, { at: 200, dur: 600 });
  wait(450).then(() => ctx.alive() && to.stage.enter());
  // 900: the paper shape pops up where the sheet landed.
  const ghost = ghostShape(id, target);
  play(ghost, [{ transform: 'scale(.3)' }, { transform: 'scale(1)' }], { duration: 280, delay: 900, easing: SPRING });
  from.ctl.hideUntil(ghost, 900);
  await finish(ctx, 1250, () => to.stage.finish());
}

export async function openTopic(ctx) {
  const { from, to, state } = ctx, row = from.ctl.rowOf(state.topic);
  const tab = from.ctl.tabRect(row);
  const sheetR = rectOf(from.ctl.sheet);
  const oldHead = q(from.screen, '.stage-head');
  lift(from.screen, 1);
  from.ctl.hideTab(row, true);
  ctx.install();

  const F = rectOf(to.page.card);
  // The tab's label stays on top for a moment, then fades, so it does not vanish the instant the fold starts.
  play(ghostTab(from.ctl.tabs[row].btn, tab), [{ opacity: 1 }, { opacity: 0 }], { duration: 160, delay: 80, easing: 'linear' });
  // 0-380: the other tabs lie flat, Nib and the heading fold away, the sheet draws in toward the tab.
  from.ctl.foldTabs({ keep: row, gap: 30, dur: 180 });
  foldOut(oldHead);
  play(from.ctl.walker, [{ transform: 'none' }, { transform: 'scale(0)' }], { duration: 200, easing: 'ease-in' });
  from.ctl.sheet.style.transformOrigin = `50% ${tab.y + tab.h / 2 - sheetR.y}px`;
  play(from.ctl.sheet, FLAT_Y, { duration: 300, delay: 150, easing: 'ease-in' });

  // 120-760: the tab opens into the page in three folds; the heading and buttons follow.
  play(to.page.card, threeFolds(F, tab), { duration: 640, delay: 120 });
  coverFlap(to.page.cover, true, { delay: 120 + 640 * .62 });
  foldIn(to.page.head, 380);
  foldIn(to.page.nav, 700);
  await finish(ctx, 1050);
}

export async function closeTopic(ctx) {
  const { from, to, prev } = ctx, row = to.ctl.rowOf(prev.topic);
  const old = rectOf(from.page.card);
  lift(from.screen, 3);
  ctx.install();

  const tab = to.ctl.tabRect(row);
  to.ctl.hideTab(row, true);
  // 0-250: the page's heading and buttons fold flat and its cover drops back over the text.
  foldOut(from.page.head);
  foldOut(from.page.nav, 0, 200);
  coverFlap(from.page.cover, false, { delay: 60 });
  // 250-900: the page folds down into the tab's place; the sheet opens behind it.
  play(from.page.card, threeFolds(old, tab, true), { duration: 640, delay: 260 });
  // 710-900: as the page reaches the tab's size, a copy of the tab with its label fades in on top of it,
  // then the page drops away. Both look the same, so the real tab can take over with no jump.
  play(ghostTab(to.ctl.tabs[row].btn, tab), [{ opacity: 0 }, { opacity: 1 }], { duration: 180, delay: 710, easing: 'linear' });
  play(from.page.card, [{ opacity: 1 }, { opacity: 0 }], { duration: 1, delay: 895 });
  to.ctl.unfold(tab, { at: 200, dur: 620 });
  const popAt = 200 + 620 * .62 + 40, gap = 45;
  to.ctl.popIn({ at: popAt, gap, dur: 300 });
  await finish(ctx, popAt + gap * (to.ctl.tabs.length - 1) + 330, () => to.ctl.hideTab(row, false));
}
