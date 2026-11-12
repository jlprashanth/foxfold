import { APP_NAME } from './config.js';
import { loadIndex, loadFacts, loadRawTopic, loadTopic } from './content.js';
import { el, svg } from './dom.js';
import { foldView } from './widgets.js';
import { addStar, hasStar, getStars, takeIntro } from './progress.js';
import { createStage } from './stage.js';
import { buildTopics } from './topics.js';
import { makeCover, motionOK, settle, turnPage } from './fx.js';
import { nibArt, nod, tilt, hop } from './nib.js';
import { starReward } from './reward.js';
import * as flow from './flow.js';
import { daysSince, REVIEW_DAYS } from './schema.js';

const app = document.getElementById('app');
document.title = APP_NAME;

// States: home | tracks | topics | topic. Each is a history entry so the
// phone's back gesture steps back one state.
// Home and tracks share one stage (Nib plus the ring of shapes), so moving between
// them animates the same drawing instead of rebuilding the page.
// Every other step has its own fold (see flow.js); with "reduce motion" on, they are plain fades.
let index;
let cur = { view: 'home' }; // the state on screen now
let shown = {};             // what is on screen: { stage, ctl (topics sheet), page (topic page) }
let drawHead = () => {};
let token = 0;              // bumped by every navigation, so a move that was overtaken stops quietly

function go(state) {
  history.pushState(state, '');
  show(state);
}
window.addEventListener('popstate', (e) => show(e.state || { view: 'home' }));

const isStage = (v) => v === 'home' || v === 'tracks';
const MOVES = { 'tracks>topics': 'openTrack', 'topics>tracks': 'closeTrack', 'topics>topic': 'openTopic', 'topic>topics': 'closeTopic' };

function show(state) {
  const view = state.view || 'home';
  const { stage } = shown;
  if (stage && stage.node.isConnected && isStage(view) && isStage(cur.view)) {
    token++;
    settle();
    stage.finish();
    cur = state;
    stage.setMode(view);
    drawHead(view);
    return;
  }
  return render(state);
}

async function render(state) {
  const my = ++token;
  settle(); // stop any move still running; elements fall back to their finished CSS state
  const view = state.view || 'home';
  const prev = cur;
  const old = { screen: app.firstElementChild, ...shown };
  const kind = motionOK() && old.screen ? MOVES[`${prev.view}>${view}`] : null;

  const screen = el('section', { class: `screen ${view}${kind ? ' flow' : ''}` });
  const nu = { screen };
  let intro = false;
  try {
    if (isStage(view)) intro = stageView(nu, view, kind === 'closeTrack' ? prev.track : null);
    else if (view === 'topics') await topicsView(nu, state.track, prev.view === 'topic' ? prev.topic : null);
    else if (view === 'topic') await topicView(nu, state.topic);
  } catch (err) {
    screen.append(el('p', { class: 'error' }, `Something went wrong: ${err.message}`));
  }
  if (my !== token) return; // another navigation overtook this one while content was loading

  const install = () => {
    cur = state;
    shown = { stage: nu.stage, ctl: nu.ctl, page: nu.page };
    if (nu.drawHead) drawHead = nu.drawHead;
    app.replaceChildren(screen);
    window.scrollTo(0, 0);
  };

  const ready = kind && (nu.stage || nu.ctl || nu.page) && (old.stage || old.ctl || old.page);
  if (ready) {
    try {
      await flow[kind]({ from: old, to: nu, state, prev, install, alive: () => my === token });
      return;
    } catch (err) {
      console.error(err); // a move failed: fall back to the plain version below
      if (my !== token) return;
      settle();
    }
  }
  install();
  if (intro) nu.stage.foldUp();
}

const backBtn = () => el('button', { class: 'tab back', onclick: () => history.back() }, '← Back');

// Returns true when this is the first ever visit (the caller then plays Nib's fold-up).
function stageView(nu, view, holdTrack) {
  const s = nu.screen;
  const head = el('div', { class: 'stage-head' });
  const tag = el('span', { class: 'tag' }, 'tap me');
  nu.stage = createStage({
    tracks: index.tracks, stars: getStars(), mode: view,
    entrance: holdTrack ? 'return' : null, hold: holdTrack,
    onTracks: () => go({ view: 'tracks' }),
    onPick: (id) => go({ view: 'topics', track: id }),
  });
  nu.drawHead = (v) => {
    s.classList.remove('home', 'tracks');
    s.classList.add(v);
    head.replaceChildren(...(v === 'home' ? [el('h1', {}, APP_NAME)] : [backBtn(), el('h2', {}, 'Pick a track')]));
  };
  nu.drawHead(view);
  s.append(head, nu.stage.node, tag);
  const intro = view === 'home' && takeIntro();
  if (intro) tag.classList.add('late');
  return intro;
}

// `from` is the topic we just came back from, so Nib is standing at its tab.
async function topicsView(nu, trackId, from) {
  const t = index.tracks.find((x) => x.id === trackId);
  if (!t) throw new Error('Unknown track');
  let busy = false;
  const onOpen = async (id, row) => {
    if (busy || !nu.ctl) return;
    busy = true;
    const mine = token;
    const arrived = await nu.ctl.walkTo(row); // Nib walks the fold line to the tab first
    busy = false;
    if (arrived && mine === token) go({ view: 'topic', track: t.id, topic: id });
  };
  nu.ctl = await buildTopics(t, { onOpen, rest: from ? t.topics.indexOf(from) : -1 });
  nu.screen.append(el('div', { class: 'stage-head' }, backBtn(), el('h2', {}, t.title)), nu.ctl.sheet);
}

// Postage stamp with the review month, source links, and a note when the topic is overdue.
function stampView(topic) {
  const d = new Date(topic.reviewed);
  const month = Number.isNaN(d.getTime()) ? topic.reviewed : d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const box = el('footer', { class: 'stamp-row' }, el('span', { class: 'stamp' }, `Checked ${month}`));
  const age = daysSince(topic.reviewed);
  if (age > (REVIEW_DAYS[topic.volatility] ?? REVIEW_DAYS.fast)) {
    box.append(el('p', { class: 'stale' }, 'This may have changed. Check the official page.'));
  }
  if (topic.sources.length) {
    box.append(el('ul', { class: 'sources' }, ...topic.sources.map((s) =>
      el('li', {}, el('a', { href: s.url, target: '_blank', rel: 'noopener' }, s.title)))));
  }
  return box;
}

async function topicView(nu, id) {
  const s = nu.screen;
  const topic = await loadTopic(id);
  const last = topic.folds.length - 1;
  let i = 0;    // the fold on screen
  let want = 0; // the fold we are turning to (taps can arrive faster than a turn finishes)
  const cover = makeCover();
  const body = el('div', { class: 'fold-body' });
  const card = el('div', { class: `fold t${topic.track}` }, body, cover);
  const star = el('span', { class: 'star', title: 'Star earned', hidden: hasStar(id) ? null : '' }, '★');
  const head = el('div', { class: 'page-head' }, backBtn(), el('h2', {}, topic.title, ' ', star));

  // Nib sits between the buttons: it nods at a right answer, tilts its head at a miss, hops at the end.
  const art = nibArt();
  const react = { yes: () => nod(art), no: () => tilt(art, -1) };
  const prevBtn = el('button', { class: 'tab', onclick: () => turn(want - 1) }, '‹ Prev');
  const nextBtn = el('button', { class: 'tab', onclick: () => (want < last ? turn(want + 1) : history.back()) });
  const count = el('span', { class: 'count' });
  const nav = el('div', { class: 'nav' }, prevBtn,
    el('div', { class: 'nav-mid' }, svg('svg', { class: 'nib-corner', viewBox: '-100 -100 200 200', width: 56, height: 56, 'aria-hidden': 'true' }, art), count), nextBtn);
  s.append(head, card, nav);
  nu.page = { card, cover, head, nav };

  let rewarded = false; // some games report "done" more than once
  const earn = () => {
    if (rewarded) return;
    rewarded = true;
    const fresh = !hasStar(id);
    addStar(id);
    hop(art);
    if (fresh) starReward(card, star);
  };

  const drawNav = () => {
    prevBtn.disabled = want === 0;
    nextBtn.textContent = want < last ? 'Next ›' : 'Done ✓';
    count.textContent = `${want + 1} / ${topic.folds.length}`;
    card.classList.toggle('more', want < last); // the page corner curls while there is more
  };
  const drawBody = () => {
    body.replaceChildren(foldView(topic.folds[i], earn, react));
    if (i === last) body.append(stampView(topic));
  };
  const turn = (n) => {
    if (n < 0 || n > last || n === want) return;
    const dir = n > want ? 1 : -1;
    want = n;
    drawNav();
    turnPage(body, dir, () => { i = n; drawBody(); });
  };

  // Swipe between folds
  let x0 = null;
  body.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  body.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (dx < -50) turn(want + 1);
    else if (dx > 50) turn(want - 1);
  });
  drawNav();
  drawBody();
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
  warmOfflineCopy();
})();

// After the first online visit, quietly fetch every topic so it is saved for aeroplane mode.
// The service worker stores each response; failures (offline) are ignored.
async function warmOfflineCopy() {
  try {
    await loadFacts();
    for (const id of index.tracks.flatMap((t) => t.topics)) await loadRawTopic(id).catch(() => {});
  } catch { /* offline or blocked: nothing to do */ }
}
