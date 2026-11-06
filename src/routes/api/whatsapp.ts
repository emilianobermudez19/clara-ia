import { createFileRoute } from "@tanstack/react-router";
import { textReply } from "@/server/ai/engine";
import { parseIncoming, sendText, verifySignature } from "@/server/whatsapp";
import { detectCrisis, HELPLINES } from "@/lib/crisis";

// Webhook de WhatsApp Cloud API ("Chía por WhatsApp"). Inactivo hasta configurar:
//   WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, CHIA_PUBLIC_URL
// Privacidad: no se guarda el número ni la conversación. Cada mensaje se responde sin historial
// (el historial por usuario requiere almacenamiento cifrado; ver roadmap).
export const Route = createFileRoute("/api/whatsapp")({
  server: {
    handlers: {
      // Verificación del webhook en el panel de Meta.
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ok =
          url.searchParams.get("hub.mode") === "subscribe" &&
          !!process.env["WHATSAPP_VERIFY_TOKEN"] &&
          url.searchParams.get("hub.verify_token") === process.env["WHATSAPP_VERIFY_TOKEN"];
        return ok ? new Response(url.searchParams.get("hub.challenge") ?? "") : new Response("Forbidden", { status: 403 });
      },
      POST: async ({ request }) => {
        const secret = process.env["WHATSAPP_APP_SECRET"];
        if (!secret) return new Response("Not configured", { status: 503 });
        const raw = await request.text();
        if (!verifySignature(raw, request.headers.get("x-hub-signature-256"), secret)) return new Response("Bad signature", { status: 401 });

        const publicUrl = process.env["CHIA_PUBLIC_URL"] ?? "https://chia.app";
        for (const msg of parseIncoming(JSON.parse(raw))) {
          try {
            let reply = await textReply({ history: [{ role: "user", text: msg.text }], channel: "whatsapp", env: process.env, publicUrl });
            if (detectCrisis(msg.text)) reply = `${reply}\n\n${HELPLINES.map((h) => `${h.name}: ${h.href}`).join("\n")}`;
            await sendText(msg.from, reply, process.env);
          } catch (err) {
            console.error("[whatsapp] reply failed", err);
          }
        }
        return new Response("OK"); // Meta exige 200 rápido; los errores se registran, no se reintentan aquí.
      },
    },
  },
});
