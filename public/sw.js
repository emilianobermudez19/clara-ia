// Service worker de Chía: instalación como app, página sin conexión y avisos de recordatorios.
// Privacidad: solo se guardan en caché archivos estáticos públicos. Nunca respuestas del chat ni de la API.
// Discreción: el aviso NUNCA muestra el nombre del medicamento, aunque el servidor lo enviara.
const CACHE = "chia-shell-v1";
const SHELL = ["/offline.html", "/icons/icon-192.png", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("chia-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Navegación: siempre red primero (datos frescos); sin red, la página sin conexión.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("/offline.html")));
  }
});

self.addEventListener("push", (event) => {
  let lang = "es";
  try {
    const data = event.data ? event.data.json() : {};
    if (data && data.lang === "en") lang = "en";
  } catch (e) {
    /* payload no JSON: se usa el texto genérico */
  }
  const body = lang === "en" ? "You have a pending reminder." : "Tienes un recordatorio pendiente.";
  event.waitUntil(
    self.registration.showNotification("Chía", {
      body,
      tag: "chia-reminder", // un solo aviso visible a la vez
      renotify: true,
      icon: "/favicon.ico",
      data: { url: "/cuenta" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/cuenta";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((wins) => {
      for (const w of wins) if ("focus" in w) { w.navigate(url); return w.focus(); }
      return self.clients.openWindow(url);
    }),
  );
});
