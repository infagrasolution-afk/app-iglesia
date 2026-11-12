// Service Worker para Notificaciones Nativas (Android / iOS PWA / Desktop)
// Sin caché de HTML/JS para garantizar que siempre cargue la última versión de producción.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          if (targetUrl && 'navigate' in client) {
            client.navigate(targetUrl).catch(() => {});
          }
          return;
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
