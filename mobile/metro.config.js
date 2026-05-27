// Configuração do Metro Bundler.
//
// O Zustand publica nos arquivos `esm/*.mjs` código com `import.meta.env.MODE`
// — sintaxe que NÃO é aceita pelo bundle clássico do Expo Web (script tag) nem
// pelo Hermes (motor JS do Android/iOS). Resultados:
//
//   Web:     Uncaught SyntaxError: Cannot use 'import.meta' outside a module
//   Hermes:  SyntaxError: `import.meta` is not supported in Hermes.
//
// Solução: interceptar `resolveRequest` em TODAS as plataformas e redirecionar
// `zustand` (e subpaths) para os arquivos CJS, que são funcionalmente
// idênticos mas usam `process.env.NODE_ENV` em vez de `import.meta.env.MODE`.
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const zustandRoot = path.resolve(__dirname, 'node_modules/zustand');

// Mapa de subpath -> caminho CJS dentro de node_modules/zustand
const zustandCjsMap = {
  zustand: path.join(zustandRoot, 'index.js'),
  'zustand/middleware': path.join(zustandRoot, 'middleware.js'),
  'zustand/middleware/immer': path.join(zustandRoot, 'middleware/immer.js'),
  'zustand/shallow': path.join(zustandRoot, 'shallow.js'),
  'zustand/vanilla': path.join(zustandRoot, 'vanilla.js'),
  'zustand/vanilla/shallow': path.join(zustandRoot, 'vanilla/shallow.js'),
  'zustand/react': path.join(zustandRoot, 'react.js'),
  'zustand/react/shallow': path.join(zustandRoot, 'react/shallow.js'),
  'zustand/traditional': path.join(zustandRoot, 'traditional.js'),
  'zustand/context': path.join(zustandRoot, 'context.js'),
};

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (Object.prototype.hasOwnProperty.call(zustandCjsMap, moduleName)) {
      return {
        filePath: zustandCjsMap[moduleName],
        type: 'sourceFile',
      };
    }
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
