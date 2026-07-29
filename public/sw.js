// public/sw.js

// 1. Tangkap Event Push Notification dari Server
self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || 'Waktu sholat telah tiba.',
      icon: data.icon || '/icon-192x192.png',
      badge: '/badge-icon.png',
      vibrate: [200, 100, 200, 100, 200], // Pola getar HP
      tag: data.tag || 'jadwal-sholat',
      renotify: true,
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '🕌 Waktu Sholat Tiba', options)
    );
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

// 2. Jika Notifikasi Diklik oleh Pengguna
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Jika PWA sudah terbuka, fokuskan tab tersebut
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Jika belum terbuka, buka window PWA baru
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
