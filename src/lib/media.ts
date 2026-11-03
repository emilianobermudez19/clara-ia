// Multimedia en el chat: la IA NUNCA inserta URLs ni imágenes arbitrarias.
// Solo puede pedir piezas de esta biblioteca, ya revisadas, escribiendo [[media:<id>]].
// La interfaz las dibuja (web) o las convierte en un enlace (WhatsApp).
import { GUIDES } from "../content/guides";

export const MEDIA_IDS = GUIDES.map((g) => g.id);

export type ReplyPart = { type: "text"; text: string } | { type: "media"; id: string };

const TOKEN = /\[\[media:([a-z0-9-]+)\]\]/g;

/** Separa el texto del modelo en trozos de texto y piezas multimedia válidas. Ids desconocidos se descartan. */
export function splitMedia(text: string, allowed: readonly string[] = MEDIA_IDS): ReplyPart[] {
  const parts: ReplyPart[] = [];
  let last = 0;
  const seen = new Set<string>();
  for (const m of text.matchAll(TOKEN)) {
    const before = text.slice(last, m.index);
    if (before.trim()) parts.push({ type: "text", text: before });
    const id = m[1] ?? "";
    if (allowed.includes(id) && !seen.has(id)) {
      parts.push({ type: "media", id });
      seen.add(id);
    }
    last = (m.index ?? 0) + m[0].length;
  }
  const rest = text.slice(last);
  if (rest.trim()) parts.push({ type: "text", text: rest });
  return parts;
}

/** Para canales de solo texto (WhatsApp): cambia cada pieza por un enlace a la guía. */
export function mediaToLinks(text: string, baseUrl: string, allowed: readonly string[] = MEDIA_IDS): string {
  return text.replace(TOKEN, (_: string, id: string) => (allowed.includes(id) ? `${baseUrl.replace(/\/$/, "")}/aprende#${id}` : "")).trim();
}
