const CACHE_NAME = 'focus-timer-v1';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './css/modules/base.css',
    './css/modules/timer.css',
    './css/modules/tasks.css',
    './css/modules/modal.css',
    './css/modules/auth.css',
    './js/app.js',
    './js/modules/state.js',
    './js/modules/elements.js',
    './js/modules/audio.js',
    './js/modules/timer.js',
    './js/modules/tasks.js',
    './js/modules/settings.js',
    './js/modules/auth.js',
    './js/modules/firebase.js',
    './js/modules/sync.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
];

// Install Event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching assets');
            return cache.addAll(ASSETS);
        })
    );
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
