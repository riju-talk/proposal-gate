// server/vite.ts
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import express from "express";
import { type Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { Request, Response, NextFunction, RequestHandler } from "express";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viteLogger = createLogger();

export async function setupVite(app: any, server: Server): Promise<void> {
  let vite: ViteDevServer;
  
  try {
    vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
      },
      configFile: path.resolve(__dirname, '..', 'vite.config.ts'),
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          process.exit(1);
        },
      },
      appType: 'custom',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Handle SPA fallback
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) return next();

      try {
        // Read index.html
        let template = await fs.promises.readFile(
          path.resolve(__dirname, '..', 'client', 'index.html'),
          'utf-8'
        );

        // Apply Vite HTML transforms
        template = await vite.transformIndexHtml(url, template);
        
        // Send the transformed HTML
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        // If an error occurs, let Vite fix the stack trace
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } catch (e) {
    console.error('Failed to start Vite dev server:', e);
    process.exit(1);
  }
}

export function serveStatic(app: any): void {
  // Serve static files from dist/public
  app.use(express.static(path.resolve(__dirname, '..', 'dist', 'public'), {
    index: false,
    maxAge: '1y',
    etag: true,
    lastModified: true,
  }));

  // Handle SPA fallback
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '..', 'dist', 'public', 'index.html'));
  });
}