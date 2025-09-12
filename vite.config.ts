import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  server: {
    allowedHosts: [
      "b1a26b6b-0854-473f-bf77-5acf5dfcbe87-00-xikxg78h0pdh.picard.replit.dev",
      "localhost",
      "0.0.0.0",
    ],
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        timeout: 60000,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
