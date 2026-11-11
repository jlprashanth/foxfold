// The content schema in one place. Used by the checker (check.html); the app trusts its content.
import { resolveFacts } from './facts.js';

export const MAX_WORDS = 45;
export const MIN_FOLDS = 4;
export const MAX_FOLDS = 7;
export const REVIEW_DAYS = { fast: 60, medium: 120, stable: 365 };
export const GAME_TYPES = ['pick', 'sort', 'flip', 'meter', 'build', 'spot'];
export const FOLD_TYPES = ['say', 'steps', ...GAME_TYPES];

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isArr = (v, min = 1) => Array.isArray(v) && v.length >= min;
const words = (...texts) => texts.filter(isStr).join(' ').split(/\s+/).filter(Boolean).length;

// Per-type checks. Each gets the fold (facts already resolved) and an `err(msg)` function.
const CHECKS = {
  say(f, err) { if (!isStr(f.text)) err('needs "text"'); },
  steps(f, err) {
    if (!isArr(f.items, 2) || !f.items.every(isStr)) err('needs "items": at least 2 strings');
  },
  pick(f, err) {
    if (!isStr(f.question)) err('needs "question"');
    if (!isArr(f.options, 2) || f.options.length > 4) err('needs "options": 2 to 4 strings');
    else if (!Number.isInteger(f.answer) || f.answer < 0 || f.answer >= f.options.length) err('"answer" must be a valid option index');
  },
  sort(f, err) {
    if (!isStr(f.prompt)) err('needs "prompt"');
    const ok = isArr(f.baskets, 2) && f.baskets.every(isStr);
    if (!ok) err('needs "baskets": at least 2 names');
    if (!isArr(f.items) || !f.items.every((i) => i && isStr(i.text))) err('needs "items": [{ "text", "basket" }]');
    else if (ok) f.items.forEach((i, n) => { if (!f.baskets.includes(i.basket)) err(`item ${n + 1}: "basket" must be one of the baskets`); });
  },
  flip(f, err) {
    if (!isStr(f.prompt)) err('needs "prompt"');
    if (!isArr(f.cards) || !f.cards.every((c) => c && isStr(c.weak) && isStr(c.strong))) err('needs "cards": [{ "weak", "strong" }]');
  },
  meter(f, err) {
    if (!isStr(f.prompt)) err('needs "prompt"');
    const d = f.data;
    if (!d || typeof d !== 'object') return err('needs "data"');
    if (!isStr(d.label)) err('data needs "label"');
    if (!(Number.isFinite(d.max) && d.max > (d.min ?? 0))) err('data "max" must be greater than "min" (default 0)');
    if (!isArr(d.stages) || !d.stages.every((s) => s && Number.isFinite(s.from) && isStr(s.text))) err('data needs "stages": [{ "from", "text" }]');
    else if (!d.stages.some((s) => s.from <= (d.min ?? 0))) err('one stage must start at the minimum');
  },
  build(f, err) {
    if (!isStr(f.prompt)) err('needs "prompt"');
    if (!isArr(f.parts, 2) || !f.parts.every((p) => p && isStr(p.label) && isStr(p.text))) err('needs "parts" (the correct order): [{ "label", "text" }]');
    if (f.extras !== undefined && !(Array.isArray(f.extras) && f.extras.every(isStr))) err('"extras" must be strings');
  },
  spot(f, err) {
    if (!isStr(f.prompt)) err('needs "prompt"');
    if (!isArr(f.segments, 2) || !f.segments.every((s) => s && isStr(s.text))) err('needs "segments": [{ "text", "fake" }]');
    else if (f.segments.filter((s) => s.fake).length !== 1) err('exactly one segment must have "fake": true');
  },
};

// The text a learner reads in one fold, for the word limit.
function readText(f) {
  if (f.type === 'say') return words(f.text);
  if (f.type === 'steps') return words(...(Array.isArray(f.items) ? f.items : []));
  return words(f.prompt, f.question);
}

const HTML = /<[a-z!\/][^>]*>/i;
const strings = (n, out = []) => {
  if (typeof n === 'string') out.push(n);
  else if (Array.isArray(n)) n.forEach((x) => strings(x, out));
  else if (n && typeof n === 'object') Object.values(n).forEach((x) => strings(x, out));
  return out;
};

export function daysSince(dateStr, today = new Date()) {
  const t = Date.parse(dateStr);
  return Number.isNaN(t) ? NaN : Math.floor((today - t) / 86400000);
}

// Returns { errors: [], warnings: [] } for one topic file.
export function validateTopic(raw, facts, expectedId, today = new Date()) {
  const errors = [];
  const warnings = [];
  const e = (m) => errors.push(m);
  if (!raw || typeof raw !== 'object') return { errors: ['not a JSON object'], warnings };

  for (const k of ['id', 'title', 'reviewed', 'volatility']) if (!isStr(raw[k])) e(`missing "${k}"`);
  if (expectedId && raw.id !== expectedId) e(`"id" is "${raw.id}" but the file is "${expectedId}"`);
  if (!Number.isInteger(raw.track)) e('missing "track" (a number)');
  if (raw.volatility && !(raw.volatility in REVIEW_DAYS)) e('"volatility" must be fast, medium or stable');
  if (!Array.isArray(raw.sources)) e('missing "sources" (may be empty for stable topics)');
  else {
    raw.sources.forEach((s, n) => { if (!s || !isStr(s.title) || !/^https?:\/\//.test(s.url || '')) e(`source ${n + 1} needs "title" and an http(s) "url"`); });
    if (raw.volatility && raw.volatility !== 'stable' && raw.sources.length === 0) e('medium and fast topics must list official sources');
  }

  const missing = [];
  const folds = resolveFacts(raw.folds, facts, missing);
  missing.forEach((p) => e(`unknown reference {{facts.${p}}}`));

  if (!Array.isArray(folds)) { e('missing "folds"'); return { errors, warnings }; }
  if (folds.length < MIN_FOLDS || folds.length > MAX_FOLDS) e(`has ${folds.length} folds; allowed ${MIN_FOLDS} to ${MAX_FOLDS}`);
  const games = folds.filter((f) => f && GAME_TYPES.includes(f.type) && f.type !== 'pick').length;
  if (games > 1 && !raw.demo) warnings.push('more than one mini-game (plan says one per topic)');

  folds.forEach((f, n) => {
    const at = `fold ${n + 1}`;
    const err = (m) => e(`${at}: ${m}`);
    if (!f || typeof f !== 'object') return err('not an object');
    if (!FOLD_TYPES.includes(f.type)) return err(`unknown type "${f.type}"`);
    CHECKS[f.type](f, err);
    const w = readText(f);
    if (w > MAX_WORDS) err(`${w} words; the limit is ${MAX_WORDS}`);
    if (strings(f).some((s) => HTML.test(s))) err('contains HTML; only **bold** and `code` are allowed');
    if (strings(f).some((s) => /\$\s?\d|\d\s?(USD|dollars)/i.test(s))) warnings.push(`${at}: looks like a price; fast-changing facts belong in facts.json`);
  });

  const age = daysSince(raw.reviewed, today);
  if (raw.reviewed && Number.isNaN(age)) e('"reviewed" must be a date like 2026-11-11');
  else if (raw.volatility in REVIEW_DAYS && age > REVIEW_DAYS[raw.volatility]) {
    warnings.push(`DUE FOR REVIEW: checked ${age} days ago (${raw.volatility} topics are reviewed every ${REVIEW_DAYS[raw.volatility]} days)`);
  }
  return { errors, warnings };
}

export function validateFacts(facts) {
  const errors = [];
  if (!facts || typeof facts !== 'object') return ['not a JSON object'];
  if (!isStr(facts.reviewed)) errors.push('missing "reviewed"');
  for (const key of ['models', 'apps']) {
    if (!isArr(facts[key])) errors.push(`missing "${key}" list`);
    else facts[key].forEach((x, n) => { if (!x || !isStr(x.name)) errors.push(`${key} ${n + 1} needs a "name"`); });
  }
  if (!isArr(facts.limits) || !facts.limits.every(isStr)) errors.push('"limits" must be a list of names');
  return errors;
}

export function validateIndex(index, topicIds) {
  const errors = [];
  if (!index || !Array.isArray(index.tracks)) return ['missing "tracks"'];
  if (!Number.isInteger(index.version)) errors.push('missing "version"');
  const seen = new Set();
  index.tracks.forEach((t) => {
    if (!isStr(t.title) || !Number.isInteger(t.id)) errors.push(`a track is missing "id" or "title"`);
    (t.topics || []).forEach((id) => { if (seen.has(id)) errors.push(`topic "${id}" listed twice`); seen.add(id); });
  });
  return errors;
}
