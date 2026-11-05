const CACHE_NAME = 'simpatik-pwa-v1';
const urlsToCache = [
  './index.html',
  './style.css',
  './config.js',
  './auth.js',
  './app.js',
  './master.js',
  './presensi.js',
  './jurnal.js',
  './evaluasi.js',
  './rekap.js',
  './ai-assistant.js',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch Cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
