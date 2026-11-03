// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  createVaultRow, decryptJSON, deriveMasterKeys, encryptJSON, generateRecoveryKey, isRecoveryKeyFormat,
  recoveryKek, unwrapKey, wrapKey,
} from "@/lib/e2e";

const FAST = 1_000; // iteraciones reducidas solo para que las pruebas sean rápidas

describe("cifrado de extremo a extremo", () => {
  it("la clave de acceso no depende de mayúsculas del correo, sí de la contraseña", async () => {
    const a = await deriveMasterKeys("Luna@Mail.com ", "contraseña-larga", FAST);
    const b = await deriveMasterKeys("luna@mail.com", "contraseña-larga", FAST);
    const c = await deriveMasterKeys("luna@mail.com", "otra-contraseña", FAST);
    expect(a.authSecret).toBe(b.authSecret);
    expect(a.authSecret).not.toBe(c.authSecret);
    expect(a.authSecret).not.toContain("contraseña");
  });

  it("solo quien conoce la contraseña abre la ficha", async () => {
    const { kek } = await deriveMasterKeys("luna@mail.com", "contraseña-larga", FAST);
    const { row } = await createVaultRow(kek, { alias: "luna", allergies: "penicilina" });
    expect(JSON.stringify(row)).not.toContain("penicilina");

    const again = await deriveMasterKeys("luna@mail.com", "contraseña-larga", FAST);
    const dek = await unwrapKey(row.wrapped_key, again.kek);
    expect(await decryptJSON(row.data, dek)).toEqual({ alias: "luna", allergies: "penicilina" });

    const wrong = await deriveMasterKeys("luna@mail.com", "adivinanza", FAST);
    await expect(unwrapKey(row.wrapped_key, wrong.kek)).rejects.toThrow();
  });

  it("la clave de recuperación también abre la ficha", async () => {
    const { kek } = await deriveMasterKeys("a@b.c", "x".repeat(12), FAST);
    const { row, recoveryKey } = await createVaultRow(kek, { ok: true });
    const dek = await unwrapKey(row.recovery_wrapped_key, await recoveryKek(recoveryKey.toLowerCase()), "chia-dek-recovery-v1");
    expect(await decryptJSON(row.data, dek)).toEqual({ ok: true });
  });

  it("una envoltura no sirve para otro uso (datos ligados)", async () => {
    const { kek } = await deriveMasterKeys("a@b.c", "x".repeat(12), FAST);
    const w = await wrapKey(new Uint8Array(32), kek, "chia-dek-v1");
    await expect(unwrapKey(w, kek, "chia-dek-recovery-v1")).rejects.toThrow();
  });

  it("detecta datos alterados", async () => {
    const dek = new Uint8Array(32).fill(7);
    const s = await encryptJSON({ a: 1 }, dek);
    const ct = atob(s.ct);
    const tampered = { ...s, ct: btoa((ct[0] === "A" ? "B" : "A") + ct.slice(1)) };
    await expect(decryptJSON(tampered, dek)).rejects.toThrow();
  });

  it("formato de la clave de recuperación", () => {
    const k = generateRecoveryKey();
    expect(k).toMatch(/^([A-Z2-9]{4}-){7}[A-Z2-9]{4}$/);
    expect(isRecoveryKeyFormat(k.toLowerCase().replace(/-/g, " "))).toBe(true);
    expect(isRecoveryKeyFormat("1234")).toBe(false);
  });
});
