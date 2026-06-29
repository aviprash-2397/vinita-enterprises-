// Vinita Enterprises — Service Worker v3
// Strategy:
//   - App code (index.html, icons, scripts): NETWORK-FIRST. So when you redeploy on
//     Netlify, the new version is picked up on the next page load. No more "cached old
//     code shown after deploy" problem.
//   - Supabase data reads: NETWORK-FIRST with cache fallback. Always fetch fresh, but
//     fall back to cached data when offline.
//   - Writes (POST/PUT/PATCH/DELETE): never cached — always go to network.

const CACHE_VERSION = 'vinita-v4-' + '20260624';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

// Install: pre-cache shell, but don't block on it (skip if any fail)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => c.addAll(APP_SHELL).catch(() => {}))
  );
  self.skipWaiting(); // activate immediately
});

// Activate: delete every old cache so stale code can't linger
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll().then(clients => {
        // Tell every open tab/window the SW has updated, so they can hard-refresh themselves
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
      }))
  );
});

// Fetch
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // Never intercept writes — let them fail naturally if offline
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return;

  // Supabase reads: network-first, fall back to cache
  const isSupabaseRead = url.hostname.endsWith('supabase.co') &&
                        url.pathname.startsWith('/rest/') &&
                        req.method === 'GET';
  if (isSupabaseRead) {
    e.respondWith(
      fetch(req).then(res => {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, clone)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(r =>
        r || new Response('[]', { headers: { 'Content-Type': 'application/json' } })
      ))
    );
    return;
  }

  // App shell + everything else: NETWORK-FIRST so deploys are seen immediately
  e.respondWith(
    fetch(req).then(res => {
      // Cache successful same-origin responses for offline fallback
      if (req.url.startsWith(self.location.origin) && res.ok) {
        const clone = res.clone();
        caches.open(CACHE_VERSION).then(c => c.put(req, clone)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
