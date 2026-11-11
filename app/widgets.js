// Data-driven widgets: one function per fold type, plain form (no animation yet).
// Each takes the fold's JSON and returns an element. Fold text is already fact-resolved.
import { el, richText } from './dom.js';
import { MASCOT_NAME } from './config.js';

const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
const msg = () => el('p', { class: 'why', hidden: '', 'aria-live': 'polite' });
const show = (p, text) => { p.replaceChildren(...richText(text)); p.hidden = false; };

function say(f) {
  return el('div', { class: 'say' }, el('span', { class: 'mini-fox', title: MASCOT_NAME }, '🦊'), el('p', {}, ...richText(f.text)));
}

function steps(f) {
  return el('ol', { class: 'steps' }, ...f.items.map((t) => el('li', {}, ...richText(t))));
}

function pick(f) {
  const box = el('div', { class: 'pick' }, el('p', { class: 'q' }, ...richText(f.question)));
  const why = msg();
  const opts = f.options.map((opt, n) => {
    const b = el('button', { class: 'opt' }, ...richText(opt));
    b.onclick = () => {
      if (box.dataset.done) return;
      box.dataset.done = '1';
      b.classList.add(n === f.answer ? 'right' : 'wrong');
      opts[f.answer].classList.add('right');
      if (f.why) show(why, f.why);
    };
    return b;
  });
  box.append(...opts, why);
  return box;
}

// sort: one item at a time; tap the basket it belongs in.
function sort(f) {
  const box = el('div', { class: 'sort' }, el('p', { class: 'q' }, ...richText(f.prompt)));
  const card = el('div', { class: 'plane' });
  const note = msg();
  const baskets = el('div', { class: 'baskets' });
  let n = 0, misses = 0;
  const next = () => {
    if (n >= f.items.length) {
      card.textContent = '✓ All sorted';
      baskets.replaceChildren();
      show(note, misses ? `Done, with ${misses} slip${misses > 1 ? 's' : ''}. Try again later to get them all first time.` : 'Done, with no slips.');
      return;
    }
    card.replaceChildren(...richText(f.items[n].text));
  };
  for (const name of f.baskets) {
    baskets.append(el('button', { class: 'basket', onclick: () => {
      const item = f.items[n];
      if (!item) return;
      if (item.basket === name) { n++; note.hidden = true; if (item.why) show(note, item.why); next(); }
      else { misses++; card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); show(note, `Not quite. Try another basket.`); }
    } }, name));
  }
  next();
  box.append(card, baskets, note);
  return box;
}

// flip: tap a card to turn it from weak to strong.
function flip(f) {
  const box = el('div', { class: 'flip' }, el('p', { class: 'q' }, ...richText(f.prompt)));
  for (const c of f.cards) {
    const face = el('div', { class: 'face' });
    const draw = (strong) => face.replaceChildren(
      el('small', {}, strong ? 'Strong' : 'Weak'),
      el('span', {}, ...richText(strong ? c.strong : c.weak)),
      ...(strong && c.note ? [el('em', {}, ...richText(c.note))] : []),
    );
    let strong = false;
    draw(false);
    box.append(el('button', { class: 'card', 'aria-label': 'Flip card', onclick: (e) => {
      strong = !strong; draw(strong); e.currentTarget.classList.toggle('strong', strong);
    } }, face));
  }
  return box;
}

// meter: drag a slider; the text changes with the stage reached.
function meter(f) {
  const d = f.data;
  const min = d.min ?? 0;
  const stages = [...d.stages].sort((a, b) => a.from - b.from);
  const fill = el('div', { class: 'fill' });
  const text = el('p', { class: 'why' });
  const readout = el('span', {});
  const slider = el('input', { type: 'range', min, max: d.max, value: min, 'aria-label': d.label });
  const update = () => {
    const v = Number(slider.value);
    fill.style.width = `${((v - min) / (d.max - min)) * 100}%`;
    readout.textContent = `${d.label}: ${v}${d.unit ? ' ' + d.unit : ''}`;
    const stage = [...stages].reverse().find((s) => v >= s.from) || stages[0];
    text.replaceChildren(...richText(stage.text));
  };
  slider.oninput = update;
  update();
  return el('div', { class: 'meter' }, el('p', { class: 'q' }, ...richText(f.prompt)), el('div', { class: 'bar' }, fill), readout, slider, text);
}

// build: tap pieces in the right order; the correct next piece snaps into place.
function build(f) {
  const box = el('div', { class: 'build' }, el('p', { class: 'q' }, ...richText(f.prompt)));
  const slots = el('ol', { class: 'slots' }, ...f.parts.map((p) => el('li', {}, el('small', {}, p.label))));
  const tray = el('div', { class: 'tray' });
  const note = msg();
  let n = 0;
  const pieces = shuffle([...f.parts.map((p, i) => ({ text: p.text, i })), ...(f.extras || []).map((t) => ({ text: t, i: -1 }))]);
  for (const p of pieces) {
    const b = el('button', { class: 'piece' }, ...richText(p.text));
    b.onclick = () => {
      if (p.i === n) {
        slots.children[n].append(el('span', {}, ...richText(p.text)));
        slots.children[n].classList.add('filled');
        b.remove(); n++; note.hidden = true;
        if (n === f.parts.length) { tray.remove(); show(note, f.done || 'Built. That is the whole prompt.'); }
      } else {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        show(note, p.i === -1 ? 'That piece does not belong here.' : `Not yet. Which part comes next: ${f.parts[n].label}?`);
      }
    };
    tray.append(b);
  }
  box.append(slots, tray, note);
  return box;
}

// spot: tap the one made-up part.
function spot(f) {
  const box = el('div', { class: 'spot' }, el('p', { class: 'q' }, ...richText(f.prompt)));
  const note = msg();
  const wrap = el('p', { class: 'segments' });
  f.segments.forEach((s) => {
    const b = el('button', { class: 'seg' }, ...richText(s.text));
    b.onclick = () => {
      if (box.dataset.done) return;
      if (s.fake) {
        box.dataset.done = '1'; b.classList.add('right');
        show(note, f.why || 'Yes, that is the made-up part.');
      } else { b.classList.add('wrong'); b.disabled = true; show(note, 'That part checks out. Keep looking.'); }
    };
    wrap.append(b, ' ');
  });
  box.append(wrap, note);
  return box;
}

const WIDGETS = { say, steps, pick, sort, flip, meter, build, spot };

export function foldView(f) {
  const make = WIDGETS[f.type];
  return make ? make(f) : el('p', {}, `(Unknown fold type "${f.type}".)`);
}
