// Seguimiento de bienestar: si alguien usa "Salir rápido" varias veces seguidas, puede que no esté a salvo.
// Seguridad primero:
//  - NUNCA se envía una notificación push (podría verla quien vigila el teléfono).
//  - El contador vive en el llavero cifrado del sistema, no en almacenamiento legible.
//  - La pregunta "¿Todo bien?" aparece DENTRO de la app, la próxima vez que la persona entra.
import * as SecureStore from "expo-secure-store";

const KEY = "chia-qx";
export const CHECK_IN_AFTER = 5;
const WINDOW_MS = 14 * 24 * 60 * 60 * 1000; // solo cuentan salidas de las últimas 2 semanas

interface State { exits: number[]; lastCheck?: number }

async function read(): Promise<State> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    const s = raw ? (JSON.parse(raw) as State) : { exits: [] };
    return { ...s, exits: (s.exits ?? []).filter((t) => Date.now() - t < WINDOW_MS) };
  } catch {
    return { exits: [] };
  }
}

async function write(s: State) {
  try { await SecureStore.setItemAsync(KEY, JSON.stringify(s)); } catch { /* sin llavero: no se cuenta */ }
}

export async function recordQuickExit(): Promise<void> {
  const s = await read();
  await write({ ...s, exits: [...s.exits, Date.now()] });
}

/** Una sesión que termina sin "Salir rápido" rompe la racha. */
export async function recordCalmSession(): Promise<void> {
  const s = await read();
  if (s.exits.length) await write({ ...s, exits: [] });
}

export async function shouldCheckIn(): Promise<boolean> {
  return (await read()).exits.length >= CHECK_IN_AFTER;
}

/** La persona respondió: se reinicia el contador. */
export async function completeCheckIn(): Promise<void> {
  await write({ exits: [], lastCheck: Date.now() });
}
