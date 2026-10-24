const CACHE_NAME = 'distributor-app-v65';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css?v=65',
    '/js/app.js?v=65',
    '/manifest.json',
    '/icons/icon-v2-192.png',
    '/icons/icon-v2-512.png',
    '/icons/store_1.png?v=65',
    '/icons/store_2.png?v=65',
    '/icons/store_3.png?v=65',
    '/icons/store_4.png?v=65',
    '/icons/store_5.png?v=65',
    '/icons/store_6.png?v=65',
    '/icons/store_1.png',
    '/icons/store_2.png',
    '/icons/store_3.png',
    '/icons/store_4.png',
    '/icons/store_5.png',
    '/icons/store_6.png',
    '/icons/product_oil.png?v=65',
    '/icons/product_sugar.png?v=65',
    '/icons/product_oil.png',
    '/icons/product_sugar.png'
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

self.addEventListener('fetch', (event) => {
    // API so'rovlarini keshlamaymiz (har doim to'g'ridan-to'g'ri serverga)
    if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
        return;
    }

    // 1. Statik resurslar (Ikonlar, rasmlar, shriftlar):
    // HAR DOIM keshdan (Cache-First) darhol olinadi - 0 millisekund va internetsiz chaqmoqdek tez!
    if (event.request.url.includes('/icons/') || 
        event.request.url.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf)(\?.*)?$/i)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                    }
                    return networkResponse;
                });
            })
        );
        return;
    }

    // 2. Boshqa sahifalar va kodlar (HTML, JS, CSS):
    // Network-First strategiyasi
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