"use client";

import { useEffect, useState } from "react";
import { useNotificationPermission } from "@/src/modules/notifications/use-notification-permission";

function decodeVapidKey(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = window.atob(normalized + padding);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function usePushSubscription() {
  const { supported, permission, requestPermission } = useNotificationPermission();
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager?.getSubscription?.())
      .then((sub) => {
        if (sub) {
          setSubscribed(true);
        }
      })
      .catch(() => undefined);
  }, []);

  const subscribe = async () => {
    if (!supported || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      throw new Error("Las notificaciones push no están disponibles en este dispositivo.");
    }

    setBusy(true);
    try {
      const nextPermission = permission === "granted" ? permission : await requestPermission();
      if (nextPermission !== "granted") {
        throw new Error("Has rechazado las notificaciones.");
      }

      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        ...(vapidKey ? { applicationServerKey: decodeVapidKey(vapidKey).buffer as ArrayBuffer } : {}),
      });

      const subJson = typeof subscription.toJSON === "function" ? subscription.toJSON() : (subscription as unknown as Record<string, unknown>);
      const keys = subJson && typeof subJson === "object" && "keys" in subJson
        ? (subJson.keys as { p256dh?: string; auth?: string })
        : undefined;

      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: keys?.p256dh ?? "",
          auth: keys?.auth ?? "",
        },
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        plataforma: typeof navigator !== "undefined"
          ? (/android/i.test(navigator.userAgent) ? "android" : /iphone|ipad|ipod/i.test(navigator.userAgent) ? "ios" : "desktop")
          : "desktop",
      };

      const response = await fetch("/v1/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setSubscribed(true);
      return subscription;
    } finally {
      setBusy(false);
    }
  };

  const unsubscribe = async () => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      try {
        await fetch("/v1/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
      } catch {
        // Red offline o error de gateway ignorado en desconexión local
      }
    }
    setSubscribed(false);
  };

  return { supported, permission, subscribed, busy, subscribe, unsubscribe };
}
