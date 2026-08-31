const CACHE_NAME = 'siswahub-v1';
const ASSETS_TO_CACHE = [
 './',
 './siswa.html',
 './manifest.json',
 'https://cdn.tailwindcss.com',
 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Event
self.addEventListener('install', (event) => {
 event.waitUntil(
  caches.open(CACHE_NAME).then((cache) => {
   return cache.addAll(ASSETS_TO_CACHE);
  })
 );
 self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
 event.waitUntil(self.clients.claim());
});

// Listener untuk Notifikasi dari Aplikasi
self.addEventListener('message', (event) => {
 if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
  const { title, body, icon } = event.data.payload;
  self.registration.showNotification(title, {
   body: body,
   icon: icon || 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png',
   badge: 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png',
   vibrate: [200, 100, 200]
  });
 }
});
