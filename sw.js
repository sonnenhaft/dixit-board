const CACHE_NAME = 'dixit-v1.8';

const ASSETS = [
    './',
    './index.html',
    './canvas-dnd-logic.js',
    './dixit-board.webp',
    './dixit-rules.webp',
    './screenshot_1.png',
    './styles.css',
    './ui-logic.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon.ico'
];

self.addEventListener('install', event => {
    self.skipWaiting();

    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS);
    })());
});

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();

        await Promise.all(
            keys.map(k => {
                if (k !== CACHE_NAME) {
                    return caches.delete(k);
                }
            })
        );

        await self.clients.claim();
    })());
});

self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
            const fresh = await fetch(event.request);
            cache.put(event.request, fresh.clone());
            return fresh;
        } catch {
            const cached = await cache.match(event.request);
            return cached || cache.match('./index.html');
        }
    })());
});