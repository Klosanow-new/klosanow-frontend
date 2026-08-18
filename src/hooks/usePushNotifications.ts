import React from "react";
import {
  deletePushSubscription,
  getVapidPublicKey,
  savePushSubscription,
} from "src/api-endpoints/notifications";

// Helper function to convert URL-safe Base64 string to a Uint8Array
// The browser's PushManager subscription method requires the applicationServerKey in this format.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const registerServiceWorker = () =>
  navigator.serviceWorker.register("/sw.js", { scope: "/" });

// App.tsx keys <Routes> on location.pathname, so the layout — and with it the
// EnablePushBanner that mounts this hook — remounts on every navigation. Module
// scope keeps the silent re-sync to one POST per page load instead of one per
// route change. Reading local subscription state stays per-mount; only the
// network call is gated.
let syncedThisPageLoad = false;

export default function usePushNotifications() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [permission, setPermission] =
    React.useState<NotificationPermission>("default");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Re-post the subscription this browser already holds. Silent and idempotent —
  // it never prompts, so it is safe on load. This is what repairs a server row
  // lost to a new device, cleared site data, a different account on the same
  // browser, or a subscription the browser rotated behind our back.
  const syncSubscription = React.useCallback(async (force = false) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);

      if (!subscription) return;
      if (!force && syncedThisPageLoad) return;

      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await savePushSubscription({ endpoint, keys });
      syncedThisPageLoad = true;
    } catch (err: any) {
      // Never surface this — the user didn't ask for it and can still subscribe
      // manually from notification settings.
      console.error("Push subscription sync failed:", err);
    }
  }, []);

  // Check browser support and current subscription status on mount
  React.useEffect(() => {
    const checkSupport = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setIsSupported(supported);

      if (!supported) return;

      setPermission(Notification.permission);

      try {
        if (Notification.permission === "granted") {
          // Re-register on every load so the worker survives a refresh, and
          // re-confirm the endpoint with the server while we're here.
          await syncSubscription();
        } else {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription =
              await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
          }
        }
      } catch (err: any) {
        console.error("Error checking active subscription:", err);
      }
    };

    checkSupport();
  }, [syncSubscription]);

  // The worker posts this after recovering from a rotated subscription — it has
  // no token of its own, so the page is what actually saves the new endpoint.
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED") {
        // Force — the endpoint genuinely changed, so the page-load guard must
        // not suppress this one.
        syncSubscription(true);
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);
    return () =>
      navigator.serviceWorker.removeEventListener("message", handleMessage);
  }, [syncSubscription]);

  const subscribe = async () => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const registration = await registerServiceWorker();
      await navigator.serviceWorker.ready;

      const publicVapidKey = await getVapidPublicKey();
      if (!publicVapidKey) {
        throw new Error("Could not load the push key from the server.");
      }

      // Must stay on the user gesture that opened this call.
      const userPermission = await Notification.requestPermission();
      setPermission(userPermission);

      if (userPermission !== "granted") {
        throw new Error("Notification permission was denied.");
      }

      // Reuse an existing browser subscription when there is one, otherwise the
      // second subscribe call throws on a key mismatch.
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        }));

      const { endpoint, keys } = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await savePushSubscription({ endpoint, keys });

      // The server is now current, so the silent re-sync has nothing to do.
      syncedThisPageLoad = true;
      setIsSubscribed(true);
    } catch (err: any) {
      console.error("Push notification subscription error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to subscribe to push notifications."
      );
      setIsSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported) return;

    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();

      if (!subscription) {
        setIsSubscribed(false);
        return;
      }

      // Read the endpoint before unsubscribing — afterwards it's gone and the
      // server row can no longer be matched.
      const { endpoint } = subscription;

      try {
        await deletePushSubscription(endpoint);
      } catch (err: any) {
        // Still drop the local subscription so the UI doesn't lie about state.
        console.error("Failed to remove subscription on the server:", err);
      }

      await subscription.unsubscribe();
      // Let a later re-subscribe sync again rather than being skipped.
      syncedThisPageLoad = false;
      setIsSubscribed(false);
    } catch (err: any) {
      console.error("Unsubscribe error:", err);
      setError(err?.message || "Failed to unsubscribe.");
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    syncSubscription,
  };
}
