export interface PushMessage {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function announceViaPush(message: PushMessage) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return false;
  }

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(message.title, {
      body: message.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: message.tag,
      data: { url: message.url ?? "/" },
      requireInteraction: true,
    });
    return true;
  }

  new Notification(message.title, { body: message.body, tag: message.tag });
  return true;
}
