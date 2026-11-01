import { describe, it, expect } from "vitest";
import { buildIntentEvent, isCountryCode } from "@/lib/countries";

describe("métricas de intención anónimas", () => {
  it("guarda solo país ISO y semana", () => {
    expect(buildIntentEvent("chat", "clinics", "MX", new Date("2026-11-05T15:30:00Z"))).toEqual({
      source: "chat", choice: "clinics", country_code: "MX", created_week: "2026-11-02",
    });
  });
  it("rechaza texto libre", () => {
    expect(isCountryCode("Colonia Roma, CDMX")).toBe(false);
    expect(() => buildIntentEvent("chat", "clinics", "Colonia Roma")).toThrow();
  });
});
