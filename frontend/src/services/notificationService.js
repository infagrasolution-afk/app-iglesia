import { announcementAPI, mediaAPI, sermonAPI, prayerAPI } from './api';

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

let syncInterval = null;

export const startBackgroundNotificationSync = (currentUser) => {
  if (syncInterval) clearInterval(syncInterval);

  const checkUpdates = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    try {
      // 1. Check Announcements
      const announcements = await announcementAPI.getAll().catch(() => []);
      const knownAnnouncements = JSON.parse(localStorage.getItem('known_announcements') || '[]');
      if (knownAnnouncements.length > 0) {
        announcements.forEach((ann) => {
          if (!knownAnnouncements.includes(ann.id)) {
            showLocalNotification(
              '📢 Nuevo Anuncio de la Iglesia',
              `${ann.title} ${ann.event_date ? '📅 (' + ann.event_date + ')' : ''}`,
              '/announcements'
            );
          }
        });
      }
      localStorage.setItem('known_announcements', JSON.stringify(announcements.map((a) => a.id)));

      // 2. Check Gallery Media
      const mediaList = await mediaAPI.getAll().catch(() => []);
      const knownMedia = JSON.parse(localStorage.getItem('known_media') || '[]');
      if (knownMedia.length > 0) {
        mediaList.forEach((m) => {
          if (!knownMedia.includes(m.id)) {
            showLocalNotification(
              m.media_type === 'video' ? '🎥 Nuevo Video en Galería' : m.media_type === 'audio' ? '🎵 Nueva Alabanza Disponible' : '📷 Nueva Foto en Galería',
              m.title,
              '/gallery'
            );
          }
        });
      }
      localStorage.setItem('known_media', JSON.stringify(mediaList.map((m) => m.id)));

      // 3. Check Sermons
      const sermons = await sermonAPI.getAll().catch(() => []);
      const knownSermons = JSON.parse(localStorage.getItem('known_sermons') || '[]');
      if (knownSermons.length > 0) {
        sermons.forEach((s) => {
          if (!knownSermons.includes(s.id)) {
            showLocalNotification(
              '🎙️ Nuevo Mensaje / Prédica',
              `${s.title} (${s.speaker || 'Pastor'})`,
              '/sermons'
            );
          }
        });
      }
      localStorage.setItem('known_sermons', JSON.stringify(sermons.map((s) => s.id)));

      // 4. Check Prayers
      const prayers = await prayerAPI.getAll().catch(() => []);
      const knownPrayers = JSON.parse(localStorage.getItem('known_prayers') || '[]');
      if (knownPrayers.length > 0) {
        prayers.forEach((p) => {
          if (!knownPrayers.includes(p.id)) {
            const isTarget = currentUser && (
              (p.target_user && p.target_user.toLowerCase() === (currentUser.email || '').toLowerCase()) ||
              (p.target_user && p.target_user.toLowerCase() === (currentUser.full_name || '').toLowerCase())
            );

            if (p.visibility === 'private' && isTarget) {
              showLocalNotification(
                '🔒 Petición de Oración Privada para Ti',
                `${p.author_name || 'Un hermano'} te ha enviado una petición de oración privada.`,
                '/prayers'
              );
            } else if (p.visibility === 'public') {
              showLocalNotification(
                '🙏 Nueva Petición de Oración',
                p.title || 'Se ha publicado un nuevo motivo de oración.',
                '/prayers'
              );
            }
          }
        });
      }
      localStorage.setItem('known_prayers', JSON.stringify(prayers.map((p) => p.id)));

    } catch (e) {
      console.warn('Background sync check failed:', e);
    }
  };

  checkUpdates();
  syncInterval = setInterval(checkUpdates, 15000);
};
