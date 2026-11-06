// @vitest-environment node
import { describe, it, expect } from "vitest";
import { sealProfile, openProfile, emptyProfile, isValidPin } from "@/lib/vault";

describe("ficha médica cifrada", () => {
  const profile = { ...emptyProfile("luna"), bloodType: "O+" as const, allergies: "penicilina" };

  it("cifra y descifra con el PIN correcto", async () => {
    const sealed = await sealProfile(profile, "482913");
    expect(sealed.ciphertext).not.toContain("penicilina");
    expect(await openProfile(sealed, "482913")).toEqual(profile);
  });
  it("rechaza un PIN incorrecto", async () => {
    const sealed = await sealProfile(profile, "482913");
    await expect(openProfile(sealed, "000000")).rejects.toThrow();
  });
  it("solo acepta PIN de 6 dígitos", () => {
    expect(isValidPin("123456")).toBe(true);
    expect(isValidPin("1234")).toBe(false);
    expect(isValidPin("12345a")).toBe(false);
  });
});

import { nextDose, normalizeProfile, upsertConsultation } from "@/lib/vault";

describe("Mi espacio", () => {
  it("fichas antiguas se completan sin perder datos", () => {
    const p = normalizeProfile({ alias: "luna", allergies: "látex" } as never);
    expect(p.allergies).toBe("látex");
    expect(p.reminders).toEqual([]);
    expect(p.consultations).toEqual([]);
  });
  it("calcula la próxima toma (hoy o mañana)", () => {
    const now = new Date(2026, 10, 1, 21, 0);
    const r = [{ id: "1", name: "PrEP", times: ["08:00", "22:00"], note: "", active: true }];
    expect(nextDose(r, now)?.at.getHours()).toBe(22);
    expect(nextDose(r, new Date(2026, 10, 1, 23, 0))?.at.getDate()).toBe(2);
    expect(nextDose([{ id: "1", name: "PrEP", times: ["08:00"], note: "", active: false }], now)).toBeNull();
  });
  it("actualiza una consulta sin duplicarla", () => {
    const c = { id: "a", date: "", title: "x", turns: [] };
    expect(upsertConsultation(upsertConsultation([], c), { ...c, title: "y" })).toEqual([{ ...c, title: "y" }]);
  });
});

import { emptyInsurance } from "@/lib/vault";

describe("seguro médico en la ficha", () => {
  it("fichas anteriores obtienen un seguro vacío", () => {
    expect(normalizeProfile({ alias: "a" } as never).insurance).toEqual(emptyInsurance());
  });
});
