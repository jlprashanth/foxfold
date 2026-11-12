// Offline cache. Works from any subfolder (e.g. /foxfold/) because every URL is
// resolved against this file's own location, never from "/".
// Bump APP_VERSION whenever anything in SHELL changes; content updates need no bump.
const APP_VERSION = 'v5';
const APP_CACHE = `foxfold-app-${APP_VERSION}`;
const CONTENT_CACHE = 'foxfold-content'; // network first, so edited JSON shows up when online

const SHELL = [
  './', 'index.html', 'manifest.webmanifest', 'app/style.css',
  'app/config.js', 'app/content.js', 'app/dom.js', 'app/facts.js', 'app/main.js',
  'app/progress.js', 'app/schema.js', 'app/widgets.js', 'app/nib.js', 'app/shapes.js', 'app/stage.js',
  'app/fx.js', 'app/flow.js', 'app/topics.js', 'app/reward.js',
  'assets/fonts/baloo2.woff2', 'assets/fonts/nunito.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
].map((p) => new URL(p, self.location).href);

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP_CACHE).then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k.startsWith('foxfold-app-') && k !== APP_CACHE) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

const CONTENT_BASE = new URL('content/', self.location).href;
const isContent = (url) => url.href.startsWith(CONTENT_BASE);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (isContent(url)) {
    e.respondWith((async () => {
      const cache = await caches.open(CONTENT_CACHE);
      try {
        const res = await fetch(req, { cache: 'no-cache' });
        if (res.ok) cache.put(url.href, res.clone());
        return res;
      } catch {
        return (await cache.match(url.href)) || Response.error();
      }
    })());
    return;
  }

  // App code: cache first. Ignore ?query so check.html?broken=1 style URLs still match.
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok && SHELL.includes(url.origin + url.pathname)) (await caches.open(APP_CACHE)).put(req, res.clone());
      return res;
    } catch {
      if (req.mode === 'navigate') return (await caches.match(new URL('index.html', self.location).href)) || Response.error();
      return Response.error();
    }
  })());
});
