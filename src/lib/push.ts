// Notificaciones push (PWA) para recordatorios con la app cerrada.
//
// Flujo: el navegador se suscribe con la clave pública VAPID (VITE_VAPID_PUBLIC_KEY) → enviamos a
// /api/push la suscripción y SOLO las horas de aviso (nunca nombres de medicamentos) → un proceso
// programado en el servidor envía un push genérico a esas horas → public/sw.js muestra un aviso discreto.
//
// Pendiente para activarlo en producción: tabla push_subscriptions en Supabase, claves VAPID y
// un cron que envíe los avisos (librería web-push). Ver docs en src/routes/api/push.ts.
import type { Reminder } from "@/lib/vault";

export interface PushSchedule {
  times: string[]; // "HH:MM" en la zona horaria de la persona, sin repetir
  timezone: string; // IANA, p. ej. "America/Mexico_City"
  lang: "es" | "en";
}

/** Datos mínimos que necesita el servidor: horas únicas de los recordatorios activos. Sin nombres ni notas. */
export function buildSchedule(reminders: Reminder[], timezone: string, lang: "es" | "en"): PushSchedule {
  const times = [...new Set(reminders.filter((r) => r.active).flatMap((r) => r.times))].sort();
  return { times, timezone, lang };
}

/** Convierte la clave VAPID (base64url) al formato que pide pushManager.subscribe. */
export function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

export const isPushSupported = () =>
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export type PushResult = "enabled" | "unsupported" | "denied" | "not-configured" | "error";

/** Pide permiso, registra el service worker, se suscribe y envía el horario. Seguro de llamar varias veces. */
export async function enableBackgroundReminders(reminders: Reminder[], lang: "es" | "en"): Promise<PushResult> {
  if (!isPushSupported()) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "denied";
  const reg = await navigator.serviceWorker.register("/sw.js");
  const vapid = import.meta.env["VITE_VAPID_PUBLIC_KEY"] as string | undefined;
  if (!vapid) return "not-configured"; // los avisos con la app abierta siguen funcionando
  try {
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource }));
    const schedule = buildSchedule(reminders, Intl.DateTimeFormat().resolvedOptions().timeZone, lang);
    const res = await fetch("/api/push", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subscription: sub.toJSON(), schedule }),
    });
    return res.ok ? "enabled" : "error";
  } catch {
    return "error";
  }
}
