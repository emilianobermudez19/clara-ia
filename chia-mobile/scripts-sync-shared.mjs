// Copia la lógica compartida de la web (../src) dentro de la app móvil (src/shared).
// Así Metro no necesita leer archivos fuera de chia-mobile. Ejecuta `npm run sync-shared`
// cada vez que cambie la lógica en la web.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const web = join(here, "..", "src");
const out = join(here, "src", "shared");
const FILES = [
  "lib/crisis.ts", "lib/media.ts", "lib/topics.ts", "lib/vault.ts", "lib/mock-answers.ts", "lib/mode.ts", "lib/otc-guard.ts",
  "content/guides.ts", "content/medicines.ts", "content/herbs.ts",
  "server/ai/master-prompt.ts", "server/ai/clinical-signals.ts",
];

// Atajos "@/" de la web → rutas relativas dentro de src/shared.
const ALIASES = {
  "server/ai/master-prompt.ts": [['"@/lib/mode"', '"../../lib/mode"'], ['"@/lib/topics"', '"../../lib/topics"']],
  "lib/otc-guard.ts": [['"@/lib/mock-answers"', '"./mock-answers"']],
};

for (const f of FILES) {
  let code = readFileSync(join(web, f), "utf8");
  if (f === "content/guides.ts") {
    // Tipos de la web que la app no necesita: se definen aquí.
    code = code
      .replace('import type { Lang } from "../lib/i18n";', 'type Lang = "es" | "en";')
      .replace('import type { IlloName } from "../components/Illustrations";', 'type IlloName = "package" | "open" | "pinch" | "clock" | "test";');
  }
  for (const [from, to] of ALIASES[f] ?? []) code = code.replaceAll(from, to);
  if (code.includes('from "@/')) throw new Error(`Quedó un alias @/ sin traducir en ${f}`);
  const dest = join(out, f);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `// COPIA GENERADA desde src/${f} (web). No editar aquí: edita la web y corre npm run sync-shared.\n${code}`);
  console.log("ok", f);
}
