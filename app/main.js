import { APP_NAME, MASCOT_NAME } from './config.js';
import { loadIndex, loadTopic } from './content.js';
import { el } from './dom.js';
import { foldView } from './widgets.js';
import { addStar, hasStar, getStars } from './progress.js';

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
  const stars = getStars();
  const grid = el('div', { class: 'grid' });
  for (const t of index.tracks) {
    const ready = t.topics.length > 0;
    const earned = t.topics.filter((id) => stars.includes(id)).length;
    grid.append(el('button', {
      class: `shape track-${t.id}${ready ? '' : ' soon'}`,
      disabled: ready ? null : '',
      onclick: () => go({ view: 'topics', track: t.id }),
    }, el('strong', {}, `${t.id}. ${t.title}`), el('small', {}, ready ? `${t.topics.length} topics · ★ ${earned}/${t.topics.length}` : 'coming soon')));
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
    const mark = () => (hasStar(id) ? ' ★' : '');
    loadTopic(id).then((tp) => (btn.textContent = tp.title + mark())).catch(() => {});
  }
  s.append(list);
}

async function topicView(s, id) {
  const topic = await loadTopic(id);
  let i = 0;
  const body = el('div', { class: 'fold' });
  const nav = el('div', { class: 'nav' });
  const star = el('span', { class: 'star', title: 'Star earned', hidden: hasStar(id) ? null : '' }, '★');
  s.append(backBtn(), el('h2', {}, topic.title, ' ', star), body, nav);
  const earn = () => { addStar(id); star.hidden = false; };

  const draw = () => {
    body.replaceChildren(foldView(topic.folds[i], earn));
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
