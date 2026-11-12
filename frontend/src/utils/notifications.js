// Sistema Central de Notificaciones Nativas, Sonido y Vibración — Iglesia Restauración

const NOTIF_HISTORY_KEY = 'restauracion_notifications_history_v1';

export function isNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission() {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export function playNotificationSoundAndVibrate() {
  // 1. Vibración nativa del dispositivo móvil (Android y navegadores compatibles)
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate([250, 120, 250, 120, 400]);
    }
  } catch {}

  // 2. Campana / Tono armónico mediante Web Audio API (funciona en Android, iPhone y PC sin archivos externos)
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes = [
      { freq: 587.33, start: 0, duration: 0.18 },    // D5
      { freq: 880.0, start: 0.16, duration: 0.22 },  // A5
      { freq: 1174.66, start: 0.34, duration: 0.45 } // D6
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.28, now + start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    });

    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, 1000);
  } catch {}
}

export async function requestAppNotificationPermission() {
  // Desbloquear audio y vibrar suavemente al tocar el botón
  playNotificationSoundAndVibrate();

  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await sendDeviceNotification({
        title: '🔔 ¡Notificaciones Activadas!',
        body: 'Recibirás alertas con sonido y vibración cuando haya cumpleaños, nuevos anuncios, oraciones o sermones en la Iglesia Restauración.',
        tag: 'welcome-notif-enabled',
        url: '/'
      });
    }
    return result;
  } catch {
    return Notification.permission || 'default';
  }
}

export function getSavedNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveNotificationToHistory(item) {
  try {
    const list = getSavedNotifications();
    const entry = {
      id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: item.title,
      body: item.body,
      url: item.url || '/',
      type: item.type || 'general',
      created_at: new Date().toISOString(),
      read: false
    };
    const updated = [entry, ...list.filter((n) => n.id !== entry.id)].slice(0, 30);
    localStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('restauracion-notifications-updated', { detail: updated }));
    return entry;
  } catch {
    return null;
  }
}

export function markAllNotificationsRead() {
  try {
    const list = getSavedNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIF_HISTORY_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('restauracion-notifications-updated', { detail: list }));
  } catch {}
}

export async function sendDeviceNotification({
  title,
  body,
  tag = undefined,
  url = '/',
  type = 'general',
  saveToFeed = true
}) {
  // Sonar y vibrar siempre que llegue una notificación
  playNotificationSoundAndVibrate();

  if (saveToFeed) {
    saveNotificationToHistory({ id: tag, title, body, url, type });
  }

  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const options = {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [250, 120, 250, 120, 400],
    renotify: Boolean(tag),
    tag: tag || `notif-${Date.now()}`,
    data: { url }
  };

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === 'function') {
        await reg.showNotification(title, options);
        return true;
      }
    }
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      if (url) window.location.href = url;
      n.close();
    };
    return true;
  } catch {
    return false;
  }
}

