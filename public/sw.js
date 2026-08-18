// Browser Service Worker for Web Push Notifications

// Take over as soon as a new version is deployed. Without these two the updated
// worker sits in "waiting" until every tab of the origin is closed, so a fix
// shipped here wouldn't reach anyone who keeps the app open.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Shared with the page so a push-delivered notification and a page-rendered one
// for the same message collapse into a single bubble instead of stacking.
const tagFor = (data) =>
  data.tag || data.chatId || data.studyChatId || data._id || undefined;

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

  const tag = tagFor(data);

  const options = {
    body: data.message || data.body || "You received a new message.",
    // Square icon, not logo.png — that's a 214x57 wordmark and renders squashed
    // in a notification bubble.
    icon: "/icon-192.png",
    badge: "/icon-192.png",
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

  if (event.action !== "close") {
    event.waitUntil(
      self.clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then((windowClients) => {
          // Same-origin only — matchAll can hand back clients we can't navigate.
          for (let i = 0; i < windowClients.length; i++) {
            const client = windowClients[i];
            if (!client.url || !("focus" in client)) continue;
            if (new URL(client.url).origin !== self.location.origin) continue;

            client.postMessage({ type: "NAVIGATE", url: clickUrl });
            return client.focus();
          }
          // Otherwise, open a new window
          if (self.clients.openWindow) {
            return self.clients.openWindow(clickUrl);
          }
        }),
    );
  }
});

// Browsers rotate push subscriptions periodically. When that happens the old
// endpoint starts returning 410 Gone on the server and push dies silently while
// the UI still reads "Subscribed" — the usual cause of notifications that worked
// once and then stopped.
//
// The worker can't POST the replacement itself: push/subscribe needs a Bearer
// token, and localStorage (where redux-persist keeps it) isn't reachable from
// worker scope. So re-subscribe here to keep the browser side valid, then ask any
// open tab to send the new endpoint to the server. With no tab open, the
// syncSubscription() call on the next app load repairs it instead.
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // Some browsers have already minted the replacement by the time this
        // fires; only subscribe again when they haven't.
        let subscription =
          await self.registration.pushManager.getSubscription();

        if (!subscription) {
          const applicationServerKey =
            event.oldSubscription?.options?.applicationServerKey;

          // Without the original key we can't re-subscribe here. The next app
          // load goes through the full subscribe path and recovers.
          if (!applicationServerKey) return;

          subscription = await self.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
          });
        }

        const windowClients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });

        for (const client of windowClients) {
          client.postMessage({
            type: "PUSH_SUBSCRIPTION_CHANGED",
            subscription: subscription.toJSON(),
          });
        }
      } catch (err) {
        console.error("pushsubscriptionchange recovery failed:", err);
      }
    })(),
  );
});
