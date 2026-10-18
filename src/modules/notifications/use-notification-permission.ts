"use client";

import { useState } from "react";

export function useNotificationPermission() {
  const supported = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof Notification === "undefined") {
      return "default";
    }
    return Notification.permission;
  });

  const requestPermission = async () => {
    if (!supported) {
      return "denied" as NotificationPermission;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    return nextPermission;
  };

  return { supported, permission, requestPermission };
}
