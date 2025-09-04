/*
  Simple PWA service worker for Next.js App Router
  - Caches app shell and static assets
  - Network-first for navigations and API
  - Stale-while-revalidate for Next static chunks and public assets
  - Offline fallback to /offline
*/

const VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  OFFLINE_URL,
  '/',
  '/favicon.ico',
  '/icon.svg',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isAssetRequest(url) {
  if (url.origin !== self.location.origin) return false;
  const { pathname } = url;
  if (pathname.startsWith('/_next/static')) return true;
  if (pathname.startsWith('/_next/image')) return true;
  return (
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2')
  );
}

function isApiRequest(url) {
  if (url.origin !== self.location.origin) return false;
  return url.pathname.startsWith('/api/');
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== 'GET') return;

  // 1) Navigations: network-first with offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          // Cache a copy for offline
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(req);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          return offline || Response.error();
        }
      })()
    );
    return;
  }

  // 2) API: network-first, fallback to cache
  if (isApiRequest(url)) {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(RUNTIME_CACHE);
          cache.put(req, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(req);
          return cached || new Response(null, { status: 503, statusText: 'Offline' });
        }
      })()
    );
    return;
  }

  // 3) Static assets: stale-while-revalidate
  if (isAssetRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(req);
        const fetchPromise = fetch(req)
          .then((res) => {
            cache.put(req, res.clone());
            return res;
          })
          .catch(() => undefined);
        return cached || fetchPromise || fetch(req);
      })()
    );
    return;
  }

  // 4) Default: try network, fallback to cache
  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch {
        const cached = await caches.match(req);
        return cached || new Response(null, { status: 503, statusText: 'Offline' });
      }
    })()
  );
});

