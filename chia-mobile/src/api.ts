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
const GROQ_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_MODEL = process.env.EXPO_PUBLIC_GROQ_MODEL ?? "llama-3.3-70b-versatile";

export type AiMode = "server" | "groq" | "demo";
export const aiMode: AiMode = API ? "server" : GROQ_KEY ? "groq" : "demo";
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
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
    if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() ?? "";
  });
}

export async function askChia(opts: {
  history: Turn[];
  mode: "easy" | "technical";
  topic: Topic | null;
  health: HealthContext | null;
}): Promise<string> {
  const lastUser = [...opts.history].reverse().find((t) => t.role === "user")?.text ?? "";
  try {
    let reply = "";
    if (aiMode === "server") {
      reply = await viaServer({ history: opts.history, mode: opts.mode, topic: opts.topic, health: opts.health });
    } else if (aiMode === "groq") {
      const system = buildSystemPrompt({ mode: opts.mode, topic: opts.topic, health: opts.health, channel: "web", mediaIds: MEDIA_IDS, lastUserText: lastUser });
      reply = await viaGroq(opts.history, system);
    }
    return reply ? enforceOtcRules(reply) : mockAnswer(lastUser);
  } catch (err) {
    console.warn("[chia] IA no disponible, respuesta de demostración:", err);
    return mockAnswer(lastUser);
  }
}
