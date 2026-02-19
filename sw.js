// Service Worker for Music Curriculum Manager PWA
const CACHE_NAME = 'music-curriculum-v4';
const ASSETS = [
    './',
    './index.html',
    './index.css',
    './jinbu.html',
    './jinbu.css',
    './templates.js',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg'
];

// Install – cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

// Activate – clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch – network-first, fallback to cache (ensures updates are always reflected)
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(response => {
            if (response.ok && event.request.url.startsWith(self.location.origin)) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
        }).catch(() => {
            return caches.match(event.request).then(cached => {
                if (cached) return cached;
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
