const CACHE_NAME = 'distributor-app-v36';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css?v=36',
    '/js/app.js?v=36',
    '/manifest.json',
    '/icons/icon-v2-192.png',
    '/icons/icon-v2-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
        )
    );
    self.clients.claim();
});

// Network-First strategiyasi:
// 1. Internet bo'lsa: har doim tarmoqdan eng yangi versiyani yuklaydi va keshni yangilab boradi.
// 2. Internet bo'lmasa (oflayn): keshda saqlangan nusxani ochib beradi.
self.addEventListener('fetch', (event) => {
    // API so'rovlarini keshlamaymiz (har doim to'g'ridan-to'g'ri serverga)
    if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request, { cache: 'no-cache' })
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && !networkResponse.redirected) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => caches.match(event.request))
    );
});