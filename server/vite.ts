// server/vite.ts
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import express, { type Application, type Request, type Response, type NextFunction } from "express";
import { type Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();

// ============================================================================
// Vite dev server integration (used in development)
// ============================================================================
export async function setupVite(app: Application, server: Server): Promise<void> {
  let vite: ViteDevServer;

  try {
    vite = await createViteServer({
      server: {
        middlewareMode: true, // run vite in middleware mode
        // HMR automatically uses the passed HTTP server in most cases
      },
      configFile: path.resolve(__dirname, "..", "vite.config.ts"),
      appType: "custom",
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          // hard exit in case vite config is broken
          process.exit(1);
        },
      },
    });

    // Mount Vite middlewares (serves JS, transforms HTML, HMR)
    app.use(vite.middlewares);

    // Handle SPA fallback for client routes
    app.use("*", async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith("/api/")) return next(); // skip API

      try {
        // 1. Load raw index.html
        let template = await fs.promises.readFile(
          path.resolve(__dirname, "..", "client", "index.html"),
          "utf-8"
        );

        // 2. Apply Vite HTML transforms (e.g. inject HMR scripts)
        template = await vite.transformIndexHtml(url, template);

        // 3. Send response
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (e) {
    console.error("[vite] Failed to start Vite dev server:", e);
    process.exit(1);
  }
}

// ============================================================================
// Static serving for production (after `vite build`)
// ============================================================================
export function serveStatic(app: Application): void {
  const distPublicPath = path.resolve(__dirname, "..", "dist", "public");
  const indexPath = path.resolve(distPublicPath, "index.html");

  // Serve static files (hashed assets)
  app.use(
    express.static(distPublicPath, {
      index: false, // we handle index.html manually
      maxAge: "1y",
      etag: true,
      lastModified: true,
    })
  );

  // SPA fallback (always return index.html)
  app.get("*", (_req: Request, res: Response) => {
    res.sendFile(indexPath);
  });
}
