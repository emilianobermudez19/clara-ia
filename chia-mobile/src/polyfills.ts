// React Native (Hermes) no trae crypto.getRandomValues; la lógica compartida lo usa para generar ids.
import * as Crypto from "expo-crypto";

const g = globalThis as unknown as { crypto?: { getRandomValues?: <T extends ArrayBufferView>(a: T) => T } };
if (!g.crypto) g.crypto = {};
if (!g.crypto.getRandomValues) {
  g.crypto.getRandomValues = <T extends ArrayBufferView>(array: T): T => Crypto.getRandomValues(array as never) as T;
}
