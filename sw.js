// ==========================================================================
// Service Worker SIMPATIK SLBN 2 PELAIHARI (PWA)
// ==========================================================================

const CACHE_NAME = 'simpatik-pwa-v2';
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

// 1. Install Event: Menyimpan aset ke cache lokal
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Membersihkan cache lama jika ada pembaruan versi
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Menyajikan aset dari cache atau mengambil dari jaringan
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // Kembalikan dari cache jika ada, atau ambil dari network
      if (response) {
        return response;
      }
      return fetch(event.request).catch(function() {
        // Fallback opsional jika offline total
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});