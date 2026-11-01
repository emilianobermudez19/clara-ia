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
