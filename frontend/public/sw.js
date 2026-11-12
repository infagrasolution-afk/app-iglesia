// Service Worker para Notificaciones en Primer y Segundo Plano (App Abierta o Cerrada)
// Iglesia Restauración — Soporta Web Push, Periodic Background Sync y Notificaciones Nativas

const API_FALLBACK = 'https://app-iglesia-backend.onrender.com/api';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n)))).then(() => self.clients.claim())
  );
});

// 1. Recepción de Push en Segundo Plano (incluso con la App cerrada)
self.addEventListener('push', (event) => {
  let payload = {
    title: '🔔 Iglesia Restauración',
    body: 'Tienes una nueva notificación en la plataforma.',
    url: '/'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [250, 120, 250, 120, 400],
    renotify: true,
    tag: payload.tag || `push-${Date.now()}`,
    data: { url: payload.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// 2. Verificación en Segundo Plano (Periodic Background Sync en Android PWA cuando la app está cerrada)
async function checkBirthdaysInBackground() {
  try {
    const now = new Date();
    if (now.getHours() < 5) return;
    const res = await fetch(`${API_FALLBACK}/members/birthdays?month=${now.getMonth() + 1}`);
    if (!res.ok) return;
    const data = await res.json();
    const todays = Array.isArray(data?.birthdays) ? data.birthdays.filter((b) => b.is_today) : [];
    const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    for (const b of todays) {
      await self.registration.showNotification(
        `🎂 ¡Hoy está de cumpleaños ${b.full_name}!`,
        {
          body: `Felicitación de las 5:00 AM de la Iglesia Restauración (${b.sede_name || b.sede_id}). ¡Bendícelo(a) en su día!`,
          icon: '/logo.png',
          badge: '/logo.png',
          vibrate: [250, 120, 250, 120, 400],
          renotify: false,
          tag: `sw-bday-5am-${b.id}-${todayStr}`,
          data: { url: '/members' }
        }
      );
    }
  } catch {}
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'restauracion-bg-check') {
    event.waitUntil(checkBirthdaysInBackground());
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'restauracion-bg-check') {
    event.waitUntil(checkBirthdaysInBackground());
  }
});

// 3. Al tocar la notificación en la barra del teléfono, abre la App
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
