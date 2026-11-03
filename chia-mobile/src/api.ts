// Conversación con el motor clínico de Chía (master prompt, roles y reglas viven en el servidor web).
// La app nunca guarda claves de IA. Sin servidor configurado, responde en modo demostración.
import { mockAnswer } from "@/lib/mock-answers";
import type { Topic } from "@/lib/topics";

export interface Turn { role: "user" | "assistant"; text: string }
export interface HealthContext { allergies: string; conditions: string; medications: string; bloodType?: string; vaccines?: string }

const API = process.env.EXPO_PUBLIC_CHIA_API_URL?.replace(/\/$/, "");
export const hasServer = !!API;

export async function askChia(opts: {
  history: Turn[];
  mode: "easy" | "technical";
  topic: Topic | null;
  health: HealthContext | null;
}): Promise<string> {
  const lastUser = [...opts.history].reverse().find((t) => t.role === "user")?.text ?? "";
  if (!API) return mockAnswer(lastUser);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);
  try {
    const res = await fetch(`${API}/api/mobile-chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ history: opts.history, mode: opts.mode, topic: opts.topic, health: opts.health }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { reply?: string };
    return data.reply?.trim() || mockAnswer(lastUser);
  } catch {
    // Sin conexión con el servidor: respuesta segura de demostración para no dejar a la persona sin nada.
    return mockAnswer(lastUser);
  } finally {
    clearTimeout(timer);
  }
}
