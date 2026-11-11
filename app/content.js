// Content loader: fetches JSON from content/ (network first; offline cache comes in milestone 6).
const cache = new Map();

async function getJSON(path) {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(path, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Could not load ${path} (${res.status})`);
  const data = await res.json();
  cache.set(path, data);
  return data;
}

export const loadIndex = () => getJSON('content/index.json');
export const loadTopic = (id) => getJSON(`content/topics/${id}.json`);
