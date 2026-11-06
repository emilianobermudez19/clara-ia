// WhatsApp Cloud API: utilidades puras (verificación de firma, lectura del webhook, envío).
// Nota de política: Meta no permite chatbots de IA de propósito general en la API de WhatsApp Business
// (desde el 15-ene-2026). Chía debe operar ahí como servicio de salud con flujos concretos
// (orientación, recordatorios, a dónde ir), no como "pregúntale lo que sea".
import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const got = header.slice(7);
  return got.length === expected.length && timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export interface IncomingText {
  from: string; // número de WhatsApp: se usa solo para responder, nunca se guarda
  id: string;
  text: string;
}

/** Extrae los mensajes de texto de un webhook de WhatsApp Cloud API. Ignora estados y otros tipos. */
export function parseIncoming(payload: unknown): IncomingText[] {
  const out: IncomingText[] = [];
  const entries = (payload as { entry?: { changes?: { value?: { messages?: unknown[] } }[] }[] })?.entry ?? [];
  for (const e of entries)
    for (const c of e.changes ?? [])
      for (const m of (c.value?.messages ?? []) as { from?: string; id?: string; type?: string; text?: { body?: string } }[])
        if (m.type === "text" && m.from && m.id && m.text?.body) out.push({ from: m.from, id: m.id, text: m.text.body.slice(0, 2000) });
  return out;
}

export async function sendText(to: string, body: string, env: Record<string, string | undefined>) {
  const token = env["WHATSAPP_TOKEN"];
  const phoneId = env["WHATSAPP_PHONE_NUMBER_ID"];
  if (!token || !phoneId) throw new Error("WhatsApp not configured");
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: body.slice(0, 4096), preview_url: true } }),
  });
  if (!res.ok) throw new Error(`WhatsApp send failed: ${res.status}`);
}
