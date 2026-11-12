// Content loader: fetches JSON from content/. The service worker (sw.js) serves the saved copy when offline.
import { resolveFacts } from './facts.js';

const cache = new Map();

export async function getJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  const data = await res.json();
  cache.set(path, data);
  return data;
}

export const loadIndex = () => getJSON('content/index.json');
export const loadFacts = () => getJSON('content/facts.json');
export const topicPath = (id) => `content/topics/${id}.json`;
export const loadRawTopic = (id) => getJSON(topicPath(id));

// A topic with {{facts...}} references filled in.
export async function loadTopic(id) {
  const [topic, facts] = await Promise.all([loadRawTopic(id), loadFacts()]);
  return { ...topic, folds: resolveFacts(topic.folds, facts) };
}
