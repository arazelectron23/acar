const CACHE_NAME = 'usta-acar-v1';
const assetsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './firebase.js',
    './favicon.png'
];

// Quraşdırma mərhələsi
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assetsToCache);
        })
    );
});

// Resursları keşdən oxumaq
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});