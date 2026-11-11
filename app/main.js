import { APP_NAME, MASCOT_NAME } from './config.js';
import { loadIndex, loadTopic } from './content.js';
import { el, richText } from './dom.js';

const app = document.getElementById('app');
document.title = APP_NAME;

// States: home | tracks | topics | topic. Each is a history entry so the
// phone's back gesture steps back one state.
let index;

function go(state) {
  history.pushState(state, '');
  render(state);
}
window.addEventListener('popstate', (e) => render(e.state || { view: 'home' }));

async function render(state) {
  const view = state.view || 'home';
  const screen = el('section', { class: `screen ${view}` });
  try {
    if (view === 'home') homeView(screen);
    else if (view === 'tracks') tracksView(screen);
    else if (view === 'topics') topicsView(screen, state.track);
    else if (view === 'topic') await topicView(screen, state.topic);
  } catch (err) {
    screen.append(el('p', { class: 'error' }, `Something went wrong: ${err.message}`));
  }
  app.replaceChildren(screen); // CSS fade-in handles the transition
  window.scrollTo(0, 0);
}

const backBtn = () => el('button', { class: 'tab back', onclick: () => history.back() }, '← Back');

function homeView(s) {
  s.append(
    el('h1', {}, APP_NAME),
    el('button', { class: 'fox', 'aria-label': `Tap ${MASCOT_NAME}`, onclick: () => go({ view: 'tracks' }) }, '🦊'),
    el('span', { class: 'tag' }, 'tap me'),
  );
}

function tracksView(s) {
  s.append(backBtn(), el('h2', {}, 'Pick a track'));
  const grid = el('div', { class: 'grid' });
  for (const t of index.tracks) {
    const ready = t.topics.length > 0;
    grid.append(el('button', {
      class: `shape track-${t.id}${ready ? '' : ' soon'}`,
      disabled: ready ? null : '',
      onclick: () => go({ view: 'topics', track: t.id }),
    }, el('strong', {}, `${t.id}. ${t.title}`), el('small', {}, ready ? `${t.topics.length} topics` : 'coming soon')));
  }
  s.append(grid);
}

function topicsView(s, trackId) {
  const t = index.tracks.find((x) => x.id === trackId);
  if (!t) throw new Error('Unknown track');
  s.append(backBtn(), el('h2', {}, t.title));
  const list = el('div', { class: 'list' });
  for (const id of t.topics) {
    const btn = el('button', { class: `tab track-${t.id}`, onclick: () => go({ view: 'topic', track: t.id, topic: id }) }, id);
    list.append(btn);
    loadTopic(id).then((tp) => (btn.textContent = tp.title)).catch(() => {});
  }
  s.append(list);
}

async function topicView(s, id) {
  const topic = await loadTopic(id);
  let i = 0;
  const body = el('div', { class: 'fold' });
  const nav = el('div', { class: 'nav' });
  s.append(backBtn(), el('h2', {}, topic.title), body, nav);

  const draw = () => {
    body.replaceChildren(foldView(topic.folds[i]));
    nav.replaceChildren(
      el('button', { class: 'tab', disabled: i === 0 ? '' : null, onclick: () => { i--; draw(); } }, '‹ Prev'),
      el('span', {}, `${i + 1} / ${topic.folds.length}`),
      i < topic.folds.length - 1
        ? el('button', { class: 'tab', onclick: () => { i++; draw(); } }, 'Next ›')
        : el('button', { class: 'tab', onclick: () => history.back() }, 'Done ✓'),
    );
  };

  // Swipe between folds
  let x0 = null;
  body.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  body.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (dx < -50 && i < topic.folds.length - 1) { i++; draw(); }
    else if (dx > 50 && i > 0) { i--; draw(); }
  });
  draw();
}

function foldView(f) {
  if (f.type === 'say') return el('div', { class: 'say' }, el('span', { class: 'mini-fox' }, '🦊'), el('p', {}, ...richText(f.text)));
  if (f.type === 'pick') return pickView(f);
  return el('p', {}, `(Fold type "${f.type}" is not built yet.)`);
}

function pickView(f) {
  const box = el('div', { class: 'pick' }, el('p', { class: 'q' }, ...richText(f.question)));
  const why = el('p', { class: 'why', hidden: '' }, ...richText(f.why || ''));
  const opts = f.options.map((opt, n) => {
    const b = el('button', { class: 'opt' }, ...richText(opt));
    b.onclick = () => {
      if (box.dataset.done) return;
      box.dataset.done = '1';
      b.classList.add(n === f.answer ? 'right' : 'wrong');
      opts[f.answer].classList.add('right');
      why.hidden = false;
    };
    return b;
  });
  box.append(...opts, why);
  return box;
}

(async function start() {
  try {
    index = await loadIndex();
  } catch (err) {
    app.append(el('p', { class: 'error' }, `Could not load content: ${err.message}`));
    return;
  }
  history.replaceState({ view: 'home' }, '');
  render({ view: 'home' });
})();
