// The craft-table stage shared by the Home and Tracks states: one SVG with Nib in the
// middle and the six track shapes in a ring. Home -> Tracks keeps the same stage, so Nib
// can hop, shrink and release the strips without the page being rebuilt.
// Layout is in SVG units, so everything scales together on any phone width.
import { MASCOT_NAME } from './config.js';
import { svg } from './dom.js';
import { nibArt, hop, tilt, fanTail, foldUp, motionOK, NIB_CENTRE, NIB_TAIL_TIP } from './nib.js';
import { shapeArt } from './shapes.js';
import { play, rectOf } from './fx.js';

const W = 360, H = 466, CX = 180, CY = 233, RX = 116, RY = 146, RY_SIDE = 112; // RY: top and bottom shapes; RY_SIDE: the four side shapes (closer together)
const NIB_HOME_SCALE = 1.4;
const STRIP_START = 120, STRIP_GAP = 90, STRIP_FLIGHT = 480; // ms; keep in step with style.css (.tracks .body)

// Long titles wrap onto two lines so labels stay small enough not to collide.
function wrap(title) {
  if (title.length <= 12 || !title.includes(' ')) return [title];
  const mid = title.length / 2;
  let best = -1;
  for (let i = 0; i < title.length; i++) {
    if (title[i] === ' ' && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  return [title.slice(0, best), title.slice(best + 1)];
}

// entrance 'return': the stage is built folded and `enter()` opens the shapes (used when a sheet
// folds back into the shape `hold`, which stays hidden until the caller reveals it).
export function createStage({ tracks, stars, mode = 'home', onTracks, onPick, entrance = null, hold = null }) {
  let current = mode;
  const back = entrance === 'return';
  const root = svg('svg', { class: `stage ${mode === 'tracks' ? 'tracks instant' : ''}${back ? ' gather back' : ''}`, viewBox: `0 0 ${W} ${H}`, role: 'group', 'aria-label': 'Craft table' });
  const ring = svg('g', { class: 'ring' });
  const strips = svg('g', { class: 'strips' });
  const labels = [];
  const places = [];
  const placeEls = {};

  const art = nibArt();
  const nibHit = svg('g', { class: 'nib-place', role: 'button', tabindex: '0', 'aria-label': `Tap ${MASCOT_NAME}` },
    svg('rect', { class: 'hit', x: -85, y: -100, width: 170, height: 190 }), art);

  const nibTap = () => {
    if (current === 'home') { tilt(art, -1); onTracks(); } // setMode adds the hop and tail fan
    else { hop(art); tilt(art, Math.random() < .5 ? -1 : 1); }
  };
  const activate = (fn) => (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } };
  nibHit.onclick = nibTap;
  nibHit.onkeydown = activate(nibTap);

  tracks.forEach((t, i) => {
    const a = (-90 + 60 * i) * Math.PI / 180;
    const x = CX + RX * Math.cos(a), y = CY + (Math.abs(Math.sin(a)) === 1 ? RY : RY_SIDE * Math.sin(a) / .866);
    const upper = Math.sin(a) < 0; // upper shapes put the label above, lower ones below (away from Nib)
    const ready = t.topics.length > 0;
    const earned = t.topics.filter((id) => stars.includes(id)).length;

    const lines = wrap(t.title);
    const lh = 18, boxH = lines.length * lh + 6;
    // Outer group places the label (attribute transform); inner .meta group is the one CSS folds.
    const label = svg('g', { class: 'meta', style: `transform-origin:0 ${upper ? boxH : 0}px` });
    const labelPos = svg('g', { transform: `translate(0 ${upper ? -44 - boxH : 44})` }, label);
    const rect = svg('rect', { class: 'paper', x: -50, y: 0, width: 100, height: boxH });
    const texts = lines.map((ln, k) => svg('text', { y: lh * (k + 1) - 3, 'text-anchor': 'middle' }, ln));
    label.append(rect, ...texts);
    labels.push({ rect, texts });

    const slot = svg('g', { class: 'meta', style: `transform-origin:0 ${upper ? -8 : 8}px` });
    const slotPos = svg('g', { transform: `translate(0 ${upper ? 52 : -52})` }, slot);
    if (ready) {
      t.topics.forEach((id, k) => slot.append(svg('circle', { class: stars.includes(id) ? 'dot on' : 'dot', cx: (k - (t.topics.length - 1) / 2) * 13, cy: 0, r: 4.5 })));
    }

    const place = svg('g', {
      class: `place t${t.id}${ready ? '' : ' soon'}${t.id === hold ? ' hold' : ''}`, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})`, style: `--i:${i}`,
      role: 'button', tabindex: ready ? '0' : '-1', 'aria-disabled': ready ? null : 'true',
      'aria-label': ready ? `${t.title}, ${t.topics.length} topics, ${earned} stars earned` : `${t.title}, coming soon`,
    }, svg('rect', { class: 'hit', x: -46, y: -46, width: 92, height: 92 }),
    svg('g', { class: 'bob' }, svg('g', { class: 'body' }, shapeArt(t.id, ready))), labelPos, slotPos);
    if (ready) {
      place.onclick = () => onPick(t.id);
      place.onkeydown = activate(() => onPick(t.id));
    }
    ring.append(place);
    placeEls[t.id] = place;
    places.push({ x, y });
  });

  root.append(ring, strips, nibHit);

  // Fit label boxes to the text once the font is ready (estimate first so nothing is invisible).
  const fit = () => labels.forEach(({ rect, texts }) => {
    const w = Math.max(...texts.map((t) => { try { return t.getBBox().width; } catch { return 0; } }));
    if (w > 0) { rect.setAttribute('width', Math.ceil(w + 16)); rect.setAttribute('x', -Math.ceil(w + 16) / 2); }
  });
  labels.forEach(({ rect, texts }) => {
    const w = Math.max(...texts.map((t) => t.textContent.length)) * 8 + 16;
    rect.setAttribute('width', w); rect.setAttribute('x', -w / 2);
  });
  requestAnimationFrame(() => { fit(); document.fonts?.ready?.then(fit); });

  if (mode === 'tracks' && !back) requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('instant')));

  // Where the tail tip is while Nib is large, in stage units.
  const tail = {
    x: CX + (NIB_TAIL_TIP.x - NIB_CENTRE.x) * NIB_HOME_SCALE,
    y: CY + (NIB_TAIL_TIP.y - NIB_CENTRE.y) * NIB_HOME_SCALE,
  };

  function releaseStrips() {
    tracks.forEach((t, i) => {
      const { x, y } = places[i];
      const wrapG = svg('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
      const strip = svg('g', { class: `strip t${t.id}` },
        svg('polygon', { points: '-34,-8 34,-8 34,0 -34,0', class: 'c1' }),
        svg('polygon', { points: '-34,0 34,0 34,8 -34,8', class: 'c2' }));
      wrapG.append(strip);
      strips.append(wrapG);
      const delay = STRIP_START + i * STRIP_GAP;
      strip.animate([
        { transform: `translate(${(tail.x - x).toFixed(1)}px,${(tail.y - y).toFixed(1)}px) rotate(${-110 + i * 44}deg) scale(.15)` },
        { transform: 'translate(0,0) rotate(0deg) scale(1)' },
      ], { duration: STRIP_FLIGHT, delay, easing: 'cubic-bezier(.2,.8,.3,1.2)', fill: 'both' });
      strip.style.transformOrigin = '0 8px';
      // Then the strip folds flat as the shape stands up in its place.
      const fold = strip.animate([{ transform: 'translate(0,0) scaleY(1)' }, { transform: 'translate(0,0) scaleY(0)' }],
        { duration: 220, delay: delay + STRIP_FLIGHT, easing: 'ease-in', fill: 'forwards' });
      fold.finished.then(() => wrapG.remove()).catch(() => {});
    });
  }

  // Nib's resting pose on the Tracks stage, and a pose that puts Nib over a viewport rect
  // (the sheet's walker). Both in stage units, so Nib can fly between the stage and a sheet.
  const REST = `translate(${CX}px,${CY}px) scale(.6)`;
  const nibPose = (r) => {
    const m = root.getScreenCTM();
    const p = new DOMPoint(r.x + r.w / 2, r.y + r.h / 2).matrixTransform(m.inverse());
    return `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) scale(${(r.w / 200 / m.a).toFixed(3)})`;
  };

  return {
    node: root,
    // Where a track's shape sits on screen (the 80-unit art, not the larger tap area).
    shapeRect(id) {
      const r = rectOf(placeEls[id].querySelector('.hit')), k = 80 / 92;
      return { x: r.x + r.w * (1 - k) / 2, y: r.y + r.h * (1 - k) / 2, w: r.w * k, h: r.h * k };
    },
    // The other shapes and labels fold flat; the chosen one is hidden (the caller shows a copy of it).
    away(id) {
      placeEls[id].classList.add('hold');
      root.classList.add('away');
    },
    nibTo: (r, opts) => play(nibHit, [{ transform: REST }, { transform: nibPose(r) }], opts),
    nibFrom: (r, opts) => play(nibHit, [{ transform: nibPose(r) }, { transform: REST }], opts),
    hideNib: () => { nibHit.style.visibility = 'hidden'; },
    enter() { root.classList.remove('instant', 'gather'); },
    // Jump to the settled Tracks look (used when a move is interrupted).
    finish() {
      root.classList.remove('instant', 'gather', 'back', 'away');
      Object.values(placeEls).forEach((p) => p.classList.remove('hold'));
      nibHit.style.visibility = '';
    },
    reveal(id) { placeEls[id].classList.remove('hold'); },
    setMode(next) {
      if (next === current) return;
      current = next;
      strips.replaceChildren();
      if (next === 'tracks') {
        if (motionOK()) { hop(art); fanTail(art); releaseStrips(); }
        root.classList.add('tracks');
      } else {
        root.classList.remove('tracks');
        tilt(art, 1);
      }
    },
    foldUp: () => foldUp(art),
  };
}
