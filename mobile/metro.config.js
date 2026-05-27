const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const zustandRoot = path.resolve(__dirname, 'node_modules/zustand');

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
