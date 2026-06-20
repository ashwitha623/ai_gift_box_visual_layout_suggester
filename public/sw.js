// Paper Plane Service Worker for Browser Notifications

self.addEventListener('install', (event) => {
  console.log('Paper Plane Service Worker installed.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Paper Plane Service Worker activated.');
  event.waitUntil(self.clients.claim());
});

// Listen to messages from frontend client to trigger local notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, data } = event.data;
    const options = {
      body: body || "You have a new message.",
      icon: icon || "/paper_plane_logo.png",
      badge: badge || "/paper_plane_logo.png",
      timestamp: Date.now(),
      data: data || {}
    };

    event.waitUntil(
      self.registration.showNotification(title || "🎁 Paper Plane Reminder", options)
    );
  }
});

// Listen to browser push event (future-proof backend push API compatibility)
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { message: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "🎁 Paper Plane Reminder";
  const options = {
    body: payload.body || payload.message || "You have a new milestone reminder.",
    icon: "/paper_plane_logo.png",
    badge: "/paper_plane_logo.png",
    timestamp: Date.now(),
    data: payload
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click: redirect to Notifications Center
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open on /notifications, focus it
      for (const client of clientList) {
        if (client.url.includes('/notifications') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow('/notifications');
      }
    })
  );
});
