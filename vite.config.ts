import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client', 'src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },

    root: path.resolve(__dirname, 'client'),

    server: {
      port: parseInt(env.VITE_PORT || '8080', 10),
      host: '0.0.0.0',
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('🔴 Proxy error:', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('🔵 Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('🟢 Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        },
      },
      watch: {
        ignored: [
          '**/server/**',
          '**/shared/**',
          '**/attached_assets/**',
          '**/dist/**',
          '**/node_modules/**',
        ],
      },
      hmr: {
        overlay: true,
      },
      clearScreen: false,
    },

    build: {
      outDir: path.resolve(__dirname, 'dist'),
      emptyOutDir: true,
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
          },
        },
      },
    },

    define: {
      'import.meta.env.APP_ENV': JSON.stringify(env.APP_ENV || mode),
    },

    logLevel: 'info',
    customLogger: {
      info: (msg, options) => {
        console.log(`\x1b[36m[VITE]\x1b[0m ${msg}`, options);
      },
      warn: (msg, options) => {
        console.log(`\x1b[33m[VITE WARN]\x1b[0m ${msg}`, options);
      },
      error: (msg, options) => {
        console.log(`\x1b[31m[VITE ERROR]\x1b[0m ${msg}`, options);
      },
    },
  };
});