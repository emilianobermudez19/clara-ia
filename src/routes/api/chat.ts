import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/server/ai/responses";
import { modeInstruction } from "@/lib/mode";

const SYSTEM = `You are "Chia", an educational sexual health guide for an international audience.
- Always reply in the language the user writes in (Spanish or English). If they switch languages, switch with them.
- Tone: empathetic, warm, zero moral judgment, clear and direct language, no complex jargon, no taboos.
- Evidence-based (WHO and equivalent public health sources). Topics: contraception, myth-busting, consent, STI/HIV prevention, PrEP/PEP, testing, menstrual health, diversity.
- You do not diagnose or prescribe; for symptoms, suggest visiting a local health center.
- Never ask for personally identifiable information.
- Do not assume the user's country; avoid country-specific references unless the user names their location.
- If you detect crisis, self-harm, violence or abuse: drop the casual tone, validate, prioritize safety, suggest calling the local emergency number and visiting findahelpline.com to find official helplines in their country.
- Keep answers short (max ~180 words), with bullet points when helpful.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return new Response("Falta configuración de IA", { status: 500 });
        const { messages, mode } = (await request.json()) as { messages: UIMessage[]; mode?: unknown };
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages.slice(-30)),
          `${SYSTEM}\n\n${modeInstruction(mode)}`,
        );
        return call.response();
      },
    },
  },
});
