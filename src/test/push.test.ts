// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildSchedule, urlBase64ToUint8Array } from "@/lib/push";
import { validatePushBody } from "@/routes/api/push";
import { topicInstruction, isTopic } from "@/lib/topics";
import { buildSystemPrompt } from "@/server/ai/master-prompt";

describe("notificaciones push", () => {
  const reminders = [
    { id: "1", name: "PrEP", times: ["20:00"], note: "1 diaria", active: true },
    { id: "2", name: "Pastilla", times: ["08:00", "20:00"], note: "", active: true },
    { id: "3", name: "Antibiótico", times: ["14:00"], note: "", active: false },
  ];
  it("al servidor solo van horas únicas, nunca nombres", () => {
    const s = buildSchedule(reminders, "America/Mexico_City", "es");
    expect(s).toEqual({ times: ["08:00", "20:00"], timezone: "America/Mexico_City", lang: "es" });
    expect(JSON.stringify(s)).not.toMatch(/PrEP|Pastilla|Antibi/);
  });
  it("convierte la clave VAPID", () => expect(Array.from(urlBase64ToUint8Array("AQID"))).toEqual([1, 2, 3]));
  it("valida la suscripción", () => {
    const ok = { subscription: { endpoint: "https://push.example/x", keys: { p256dh: "a", auth: "b" } }, schedule: { times: ["08:00"], timezone: "UTC", lang: "es" } };
    expect(validatePushBody(ok)).toBeNull();
    expect(validatePushBody({ ...ok, schedule: { ...ok.schedule, times: ["25:00"] } })).toBe("invalid times");
    expect(validatePushBody({ ...ok, subscription: { endpoint: "http://x", keys: { p256dh: "a", auth: "b" } } })).toBe("invalid subscription");
  });
});

describe("categorías de consulta", () => {
  it("solo acepta las 4 categorías", () => {
    expect(isTopic("sexual")).toBe(true);
    expect(isTopic("hack")).toBe(false);
    expect(topicInstruction("hack")).toBe("");
  });
  it("el tema llega al prompt sin quitar reglas", () => {
    const p = buildSystemPrompt({ mode: "easy", topic: "symptoms", channel: "web", mediaIds: [] });
    expect(p).toMatch(/SYMPTOMS & TRIAGE/);
    expect(p).toMatch(/do NOT diagnose/);
  });
});
