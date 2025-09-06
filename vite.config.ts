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
      port: parseInt(env.VITE_PORT || '5000', 10),
      strictPort: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
      watch: {
        ignored: [
          '**/server/**',               // Prevent watching server files (DB logic)
          '**/shared/**',
          '**/attached_assets/**',
          '**/dist/**',
          '**/node_modules/**',
        ],
      },
      hmr: {
        overlay: false,   // Avoid UI overlay, but only as fallback
      },
      clearScreen: false,
    },

    build: {
      outDir: path.resolve(__dirname, 'client', 'dist'),
      emptyOutDir: true,
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
          },
        },
      },
    },

    define: {
      'import.meta.env.APP_ENV': JSON.stringify(env.APP_ENV || mode),
    },
  };
});
