// Web Notification & Service Worker Helper Service for PWA

export const checkNotificationSupport = () => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

export const getNotificationPermissionState = () => {
  if ('Notification' in window) {
    return Notification.permission; // 'default', 'granted', 'denied'
  }
  return 'unsupported';
};

export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Permiso de notificaciones concedido por el usuario.');
      // Display a welcome notification
      showLocalNotification(
        '⛪ Notificaciones Activadas',
        'Recibirás avisos sobre eventos, anuncios importantes y sermones de la Iglesia Restauración.'
      );
      return true;
    }
  } catch (err) {
    console.warn('Error al solicitar permiso de notificaciones:', err);
  }
  return false;
};

export const showLocalNotification = (title, body, targetUrl = '/announcements') => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const options = {
    body,
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [200, 100, 200],
    data: { url: targetUrl },
    tag: 'iglesia-notification-' + Date.now(),
    renotify: true
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options);
    });
  } else {
    try {
      const n = new Notification(title, options);
      n.onclick = () => {
        window.focus();
        if (targetUrl) window.location.href = targetUrl;
      };
    } catch (e) {
      console.warn('Fallback notification creation failed:', e);
    }
  }
};
