import { createFileRoute } from "@tanstack/react-router";

// Registro de suscripciones push para recordatorios con la app cerrada.
// Estado: valida y acepta la solicitud, pero TODAVÍA NO la guarda (respuesta 202, stored: false).
//
// Para activarlo:
//  1. Genera claves VAPID (npx web-push generate-vapid-keys). Pública → VITE_VAPID_PUBLIC_KEY; privada → VAPID_PRIVATE_KEY.
//  2. Tabla push_subscriptions (endpoint, p256dh, auth, times text[], timezone, lang), con RLS sin lectura desde el cliente.
//  3. Un proceso programado cada minuto que, para cada suscripción con la hora local actual en `times`,
//     envía un push vacío o {lang} con la librería web-push. Nunca nombres de medicamentos.
//  4. Endpoint DELETE para darse de baja (y al borrar Mi espacio).

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

interface Body {
  subscription?: { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  schedule?: { times?: unknown; timezone?: unknown; lang?: unknown };
}

export function validatePushBody(b: Body): string | null {
  const s = b.subscription;
  if (!s || typeof s.endpoint !== "string" || !s.endpoint.startsWith("https://")) return "invalid subscription";
  if (typeof s.keys?.p256dh !== "string" || typeof s.keys?.auth !== "string") return "invalid keys";
  const sc = b.schedule;
  if (!sc || !Array.isArray(sc.times) || sc.times.length > 24 || !sc.times.every((t) => typeof t === "string" && HHMM.test(t))) return "invalid times";
  if (typeof sc.timezone !== "string" || sc.timezone.length > 64) return "invalid timezone";
  if (sc.lang !== "es" && sc.lang !== "en") return "invalid lang";
  return null;
}

export const Route = createFileRoute("/api/push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try { body = (await request.json()) as Body; } catch { return Response.json({ error: "invalid json" }, { status: 400 }); }
        const error = validatePushBody(body);
        if (error) return Response.json({ error }, { status: 400 });
        return Response.json({ stored: false, reason: "push storage not configured yet" }, { status: 202 });
      },
    },
  },
});
