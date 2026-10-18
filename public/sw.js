const CACHE_NAME = "siae-shell-v2";
const SHELL_ASSETS = [
  "/",
  "/tipificar",
  "/perfil",
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/maplibre/maplibre-gl-worker.mjs",
  "/maplibre/maplibre-gl-shared.mjs",
];

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(self.registration.showNotification(data.title ?? "SIAE", {
    body: data.body ?? "Tienes un aviso nuevo.",
    icon: "/icons/icon-192.svg",
    badge: "/icons/icon-192.svg",
    tag: data.tag,
    data: { url: data.url ?? "/" },
    requireInteraction: true,
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url ?? "/", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
    const client = clients.find((candidate) => "focus" in candidate);
    if (client && "navigate" in client) {
      return client.navigate(targetUrl).then((focusedClient) => focusedClient?.focus());
    }
    return self.clients.openWindow(targetUrl);
  }));
});

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline").then((response) => response || caches.match("/").then((home) => home || Response.error()))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone();
        void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    })),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "siae-outbox-sync") {
    event.waitUntil(self.clients.matchAll().then((clients) => {
      clients.forEach((client) => client.postMessage({ type: "siae-outbox-sync" }));
    }));
  }
});
