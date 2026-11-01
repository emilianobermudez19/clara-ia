import { createFileRoute } from "@tanstack/react-router";
import { textReply, type TextTurn } from "@/server/ai/engine";

// Canal de la app móvil (chia-mobile). Mismo motor clínico que la web: master prompt, roles y reglas.
// Respuesta en JSON (sin streaming) porque fetch en React Native no lee flujos de forma fiable.
const MAX_TEXT = 2000;

function sanitizeHistory(raw: unknown): TextTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is { role: unknown; text: unknown } => !!t && typeof t === "object")
    .map((t) => ({ role: t.role === "assistant" ? ("assistant" as const) : ("user" as const), text: typeof t.text === "string" ? t.text.slice(0, MAX_TEXT) : "" }))
    .filter((t) => t.text.trim().length > 0)
    .slice(-30);
}

export const Route = createFileRoute("/api/mobile-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { history?: unknown; mode?: unknown; topic?: unknown; health?: unknown };
        try { body = (await request.json()) as typeof body; } catch { return Response.json({ error: "invalid json" }, { status: 400 }); }
        const history = sanitizeHistory(body.history);
        if (!history.some((t) => t.role === "user")) return Response.json({ error: "empty" }, { status: 400 });
        const reply = await textReply({
          history,
          mode: body.mode,
          topic: body.topic,
          health: body.health,
          channel: "web",
          env: process.env,
          publicUrl: process.env["CHIA_PUBLIC_URL"] ?? "",
          keepMedia: true,
        });
        return Response.json({ reply });
      },
    },
  },
});
