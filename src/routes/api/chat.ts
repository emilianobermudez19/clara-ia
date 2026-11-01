import { createFileRoute } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { streamWebReply } from "@/server/ai/engine";

// Canal web. Toda la lógica clínica vive en src/server/ai (engine + master-prompt).
export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, mode, topic, health } = (await request.json()) as { messages: UIMessage[]; mode?: unknown; topic?: unknown; health?: unknown };
        return streamWebReply({ request, ui: messages, mode, topic, health, env: process.env });
      },
    },
  },
});
