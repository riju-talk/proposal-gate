import * as dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from 'cookie-parser';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { createServer, type Server } from "http";
import path from 'path';
import { fileURLToPath } from 'url';

// Proper __dirname resolution in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = (message: string, level: string = "info") => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const app = express();

console.log("[api] Booting Express API server...");

// Trust proxy for rate limiting
app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());


// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && !reqPath.includes('/auth/')) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    log(`Error ${status}: ${message}`, "error");
    res.status(status).json({ error: message });
  });

  const isDev = app.get("env") === "development";
  const integratedDev = process.env.INTEGRATED_DEV === 'true';
  let server: Server | undefined;
  if (isDev && integratedDev) {
    // Create a single HTTP server to share with Vite for HMR
    server = createServer(app);
    await setupVite(app, server);
  } else if (!isDev) {
    serveStatic(app);
  }

  const port = parseInt(process.env.API_PORT || "3000");
  const onListening = () => {
    log(`🚀 Express API Server running on port ${port}`);
    log(`📧 SMTP configured: ${process.env.SMTP_USER ? 'Yes' : 'No (using console logs)'}`);
    log(`🔒 Environment: ${app.get("env")}`);
    log(`🔑 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'Using default (change in production)'}`);
    console.log("✅ API Server started successfully with database and routes");
  };

  if (server) {
    server.listen(port, "0.0.0.0", onListening);
  } else {
    app.listen(port, "0.0.0.0", onListening);
  }
})();
