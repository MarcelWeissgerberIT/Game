// Offline cache for Hotel Nocturne. Bump CACHE when assets change.
const CACHE = 'nocturne-v6';
const ASSETS = [
  './', './index.html', './css/style.css', './manifest.webmanifest',
  './js/main.js', './js/engine.js', './js/levels.js',
  ...[101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210].flatMap((n) => [`./js/puzzles/${n}.js`, `./assets/rooms/${n}.webp`]),
  './js/floors.js', './js/i18n.js', './js/lang/de.js', './js/puzzles/special.js', './js/lib/room.js', './js/lib/widgets.js', './js/lib/clues.js',
  ...[3, 4, 5, 6, 7, 8, 9, 10].flatMap((f) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => `./assets/rooms/${f * 100 + r}.webp`)),
  './assets/ui/title.webp', './assets/ui/icon-192.png', './assets/ui/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
