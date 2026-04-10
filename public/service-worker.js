// Public/service-worker.js - Web Push Notifications Service Worker

self.addEventListener('push', function (event) {
  let data = event.data.json();
  let options = {
    body: data.message,
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.urgent || false,
    actions: [
      {
        action: 'open',
        title: 'View'
      },
      {
        action: 'close',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'VenueFlow', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].url === '/' && 'focus' in clientList[i]) {
            return clientList[i].focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});
