import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      include: /\.(jsx|js|tsx|ts)$/,
      babel: {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
          '@babel/preset-typescript'
        ]
      }
    })
  ],
  root: __dirname,
  publicDir: 'public',
  build: {
    outDir: 'dist/web',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Image/AssetRegistry': 'react-native-web/dist/modules/AssetRegistry',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/BatchedBridge/NativeModules': 'react-native-web/dist/exports/NativeModules',
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      '@cargolink/shared': path.resolve(__dirname, '../shared/src')
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
    mainFields: ['react-native', 'browser', 'module', 'main']
  },
  define: {
    global: 'globalThis',
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.EXPO_PUBLIC_API_URL': JSON.stringify(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'),
    // CommonJS compatibility fixes
    'require': 'undefined',
    'module': 'undefined',
    'exports': 'undefined'
  },
  server: {
    port: 3003,
    host: true,
    hmr: {
      overlay: true
    },
    fs: {
      allow: ['..']
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-native-web'
    ],
    exclude: [
      'react-native',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'react-native-screens',
      'react-native-safe-area-context',
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@react-navigation/bottom-tabs',
      '@react-navigation/elements'
    ],
    esbuildOptions: {
      target: 'es2020',
      jsx: 'automatic',
      define: {
        global: 'globalThis',
        require: 'undefined',
        module: 'undefined',
        exports: 'undefined'
      },
      resolveExtensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx'
      }
    }
  },
  esbuild: {
    target: 'es2020',
    jsx: 'automatic',
    jsxImportSource: 'react',
    loader: 'tsx',
    include: /\.(tsx?|jsx?)$/,
    exclude: []
  }
});