// Змінюйте версію при кожному оновленні файлів, щоб телефон підтягнув нову версію
const CACHE = 'life-app-v2';
const ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Кеш першим (працює офлайн) + тиха фонова перевірка оновлень; логотипи та Telegram-скрипт кешуються після першого завантаження
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached || (e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()));
      return cached || network;
    })
  );
});
