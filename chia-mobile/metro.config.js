// Metro: permite importar la lógica compartida de la web (../src) con el alias "@/…",
// igual que en el proyecto web. Solo se importan módulos puros (sin React DOM ni servidor).
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const webSrc = path.resolve(projectRoot, "../src");
const config = getDefaultConfig(projectRoot);

config.watchFolders = [webSrc];
// Las dependencias se resuelven SOLO desde chia-mobile/node_modules (no desde la web).
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];
config.resolver.disableHierarchicalLookup = true;

// "@/lib/crisis" → <repo>/src/lib/crisis (ruta absoluta). Expo trae su propio alias por tsconfig;
// está desactivado en app.json (experiments.tsconfigPaths: false) para que no choque con este.
const upstream = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstream ?? context.resolveRequest;
  if (moduleName.startsWith("@/")) {
    return resolve(context, path.join(webSrc, moduleName.slice(2)), platform);
  }
  return resolve(context, moduleName, platform);
};

module.exports = config;
