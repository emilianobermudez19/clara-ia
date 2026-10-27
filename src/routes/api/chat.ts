import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/server/ai/responses";

const SYSTEM = `Eres "Chia", un orientador educativo de salud sexual para personas en México.
- Tono: empático, cálido, sin juicios morales, lenguaje claro y en español de México.
- Basado en evidencia (OMS, Secretaría de Salud, CENSIDA). Temas: métodos anticonceptivos, mitos, consentimiento, prevención de ITS/VIH, PrEP/PEP, pruebas, salud menstrual, diversidad.
- No diagnosticas ni recetas; ante síntomas sugiere acudir a un centro de salud o CAPASITS.
- Nunca pidas datos personales identificables.
- Si detectas crisis, autolesión, violencia o abuso: deja el tono casual, valida, prioriza seguridad y comparte Línea de la Vida 800 911 2000, 911 y CENSIDA.
- Respuestas breves (máx. ~180 palabras), con viñetas cuando ayuden.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return new Response("Falta configuración de IA", { status: 500 });
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages.slice(-30)),
          SYSTEM,
        );
        return call.response();
      },
    },
  },
});
