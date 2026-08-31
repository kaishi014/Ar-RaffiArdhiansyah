const CACHE_NAME = 'siswahub-v3';
const ASSETS_TO_CACHE = [
  './',
  './siswa.html',
  './manifest.json',
  './icon.svg',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./siswa.html');
          }
          return caches.match('./icon.svg');
        });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge } = event.data.payload || {};
    
    self.registration.showNotification(title || 'Siswa Hub', {
      body: body || 'Ada pengingat baru untukmu.',
      icon: icon || './icon.svg',
      badge: badge || './icon.svg',
      tag: title, // Prevent duplicate notifications
      requireInteraction: false,
      vibrate: [200, 100, 200],
      silent: false,
      actions: [
        {
          action: 'open',
          title: 'Buka Aplikasi'
        }
      ]
    }).catch((error) => {
      console.error('Gagal menampilkan notifikasi:', error);
    });
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the app
      for (let client of clientList) {
        if (client.url === './' || client.url.includes('siswa.html')) {
          return client.focus();
        }
      }
      // If not, open the app
      if (clients.openWindow) {
        return clients.openWindow('./');
      }
    })
  );
});
