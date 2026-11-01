// Service worker de Chía: avisos de recordatorios con la app cerrada.
// Discreción: el aviso NUNCA muestra el nombre del medicamento, aunque el servidor lo enviara.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

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
