// sw.js — Service Worker для MindCare
const CACHE_NAME = 'mindcare-v1.0.0';
const CACHE_URLS = [
    'index.html',
    'pages/articles.html',
    'pages/contacts.html',
    'pages/exercises.html',
    'pages/mood-tracker.html',
    'pages/tests.html',
    'variables.css',
    'style.css',
    'responsive.css',
    'utils.js',
    'main.js',
    'data/contacts.json',
    'data/emergency.json',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_URLS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then(response => {
            return response || fetch(e.request);
        })
    );
});

self.addEventListener('activate', (e) => {
    const cacheWhitelist = [CACHE_NAME];
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (!cacheWhitelist.includes(key)) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});