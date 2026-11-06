// Conversación con el motor clínico de Chía. Tres modos, en este orden:
//  1. EXPO_PUBLIC_CHIA_API_URL → servidor web de Chía (producción: la clave de IA nunca está en el teléfono).
//  2. EXPO_PUBLIC_GROQ_API_KEY  → Groq directo desde el teléfono, con el MISMO master prompt y protecciones.
//     Solo para pruebas en Expo Go: una clave dentro de la app puede extraerse. No publicar así en tiendas.
//  3. Ninguno → modo demostración (respuestas preparadas).
import { mockAnswer } from "./shared/lib/mock-answers";
import { enforceOtcRules } from "./shared/lib/otc-guard";
import { MEDIA_IDS } from "./shared/lib/media";
import { buildSystemPrompt } from "./shared/server/ai/master-prompt";
import type { Topic } from "./shared/lib/topics";

export interface Turn { role: "user" | "assistant"; text: string }
export interface HealthContext { allergies: string; conditions: string; medications: string; bloodType?: string; vaccines?: string }

const API = process.env.EXPO_PUBLIC_CHIA_API_URL?.replace(/\/$/, "");
// Acepta Groq (claves "gsk_…") o Grok de xAI (claves "xai-…"): se detecta por el prefijo de la clave,
// así funciona aunque la clave esté en cualquiera de las dos variables.
const RAW_KEY = (process.env.EXPO_PUBLIC_XAI_API_KEY || process.env.EXPO_PUBLIC_GROQ_API_KEY || process.env.EXPO_PUBLIC_AI_API_KEY || "").trim();
const IS_XAI = RAW_KEY.startsWith("xai-");
const GROQ_KEY = RAW_KEY || undefined;
const PROVIDER_URL = IS_XAI ? "https://api.x.ai/v1/chat/completions" : "https://api.groq.com/openai/v1/chat/completions";
const PROVIDER_NAME = IS_XAI ? "Grok (xAI)" : "Groq";
const GROQ_MODEL = IS_XAI
  ? process.env.EXPO_PUBLIC_XAI_MODEL ?? "grok-3-mini"
  : process.env.EXPO_PUBLIC_GROQ_MODEL ?? "llama-3.3-70b-versatile";

export type AiMode = "server" | "groq" | "demo";
export const aiMode: AiMode = API ? "server" : GROQ_KEY ? "groq" : "demo";
/** Nombre legible del proveedor activo, para el diagnóstico. */
export const aiProviderLabel = aiMode === "server" ? "Servidor de Chía" : aiMode === "groq" ? PROVIDER_NAME : "Demostración";
export const hasServer = aiMode !== "demo";

async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>, ms = 30_000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try { return await fn(ctrl.signal); } finally { clearTimeout(timer); }
}

async function viaServer(body: object): Promise<string> {
  return withTimeout(async (signal) => {
    const res = await fetch(`${API}/api/mobile-chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return ((await res.json()) as { reply?: string }).reply?.trim() ?? "";
  });
}

async function viaGroq(history: Turn[], system: string): Promise<string> {
  return withTimeout(async (signal) => {
    const res = await fetch(PROVIDER_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.3,
        max_tokens: 700,
        messages: [{ role: "system", content: system }, ...history.slice(-30).map((t) => ({ role: t.role, content: t.text }))],
      }),
      signal,
    });
    if (!res.ok) throw new Error(`${PROVIDER_NAME} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  });
}

/** Estado de la IA para mostrarlo en pantalla (sin exponer la clave). */
export interface AiStatus { ok: boolean; detail: string }
let lastStatus: AiStatus = { ok: aiMode !== "demo", detail: aiMode === "demo" ? "no-key" : "ready" };
export const getAiStatus = () => lastStatus;

/** Explica el error en palabras simples. */
function describe(err: unknown): string {
  const m = String((err as Error)?.message ?? err);
  if (m.includes("401") || m.includes("invalid_api_key")) return `${PROVIDER_NAME} rechazó la clave (401). Revisa que la clave en chia-mobile/.env sea correcta y esté activa.`;
  if (m.includes("429")) return `${PROVIDER_NAME} alcanzó su límite de uso (429). Espera un minuto o revisa tu plan o saldo.`;
  if (m.includes("404") || m.includes("model")) return `${PROVIDER_NAME} no encontró el modelo ${GROQ_MODEL}. Cámbialo en .env (${IS_XAI ? "EXPO_PUBLIC_XAI_MODEL" : "EXPO_PUBLIC_GROQ_MODEL"}).`;
  if (m.includes("Aborted") || m.includes("abort")) return "La IA tardó demasiado en responder. Revisa tu conexión.";
  if (m.includes("Network") || m.includes("fetch")) return "Sin conexión con la IA. Revisa el internet del teléfono.";
  return `Error de la IA: ${m.slice(0, 120)}`;
}

/** Prueba rápida de conexión con la IA (se usa en el diagnóstico de la pantalla de chat). */
export async function testAi(): Promise<AiStatus> {
  if (aiMode === "demo") return (lastStatus = { ok: false, detail: "no-key" });
  try {
    const r = aiMode === "groq" ? await viaGroq([{ role: "user", text: "Responde solo: ok" }], "Reply with: ok") : await viaServer({ history: [{ role: "user", text: "ok" }] });
    return (lastStatus = { ok: !!r, detail: r ? "ok" : "Respuesta vacía de la IA." });
  } catch (err) {
    return (lastStatus = { ok: false, detail: describe(err) });
  }
}

export async function askChia(opts: {
  history: Turn[];
  mode: "easy" | "technical";
  topic: Topic | null;
  health: HealthContext | null;
  lang?: "es" | "en";
}): Promise<string> {
  const lastUser = [...opts.history].reverse().find((t) => t.role === "user")?.text ?? "";
  try {
    let reply = "";
    if (aiMode === "server") {
      reply = await viaServer({ history: opts.history, mode: opts.mode, topic: opts.topic, health: opts.health });
    } else if (aiMode === "groq") {
      const langNote = opts.lang === "en" ? "\n\nThe app interface is in English: reply in English unless the user writes in Spanish." : "";
      const system = buildSystemPrompt({ mode: opts.mode, topic: opts.topic, health: opts.health, channel: "web", mediaIds: MEDIA_IDS, lastUserText: lastUser }) + langNote;
      reply = await viaGroq(opts.history, system);
    }
    lastStatus = { ok: !!reply || aiMode === "demo", detail: aiMode === "demo" ? "no-key" : reply ? "ok" : "Respuesta vacía de la IA." };
    return reply ? enforceOtcRules(reply) : mockAnswer(lastUser);
  } catch (err) {
    lastStatus = { ok: false, detail: describe(err) };
    console.warn("[chia] IA no disponible, respuesta de demostración:", err);
    return mockAnswer(lastUser);
  }
}
