// Browser Service Worker for Web Push Notifications

self.addEventListener("push", (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { message: event.data.text() };
    }
  }

  const title = data.title || "Klosanow";

  const tag = data.tag || data.chatId || data.studyChatId || undefined;

  const options = {
    body: data.message || data.body || "You received a new message.",
    icon: "/logo.png",
    badge: "/logo.png",
    tag,
    renotify: !!tag,
    data: {
      url: data.click_url || data.url || "/study-chat",
    },
    // Visual indicators
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "Open App" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Event handler for notification interactions (e.g. click on the bubble or actions)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const clickUrl = event.notification.data?.url || "/study-chat";

  // Only run if the action clicked wasn't 'close'
  if (event.action !== "close") {
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // If there's already an open tab of the app, focus it and redirect
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (client.url && "focus" in client) {
              client.postMessage({ type: "NAVIGATE", url: clickUrl });
              return client.focus();
            }
          }
          // Otherwise, open a new window
          if (clients.openWindow) {
            return clients.openWindow(clickUrl);
          }
        })
    );
  }
});
