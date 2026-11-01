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

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith("@/")) {
    return context.resolveRequest(context, path.join(webSrc, moduleName.slice(2)), platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
