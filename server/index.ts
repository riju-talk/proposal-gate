// server/index.ts
import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";

// ==================== Environment Setup ====================
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 3000;
const CLIENT_PORT = process.env.VITE_PORT || 5000;

const allowedOrigins = [
  `http://localhost:${CLIENT_PORT}`,
  `http://127.0.0.1:${CLIENT_PORT}`,
  // Add production domains here
];

// ==================== Paths ====================
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ==================== App & Server ====================
const app = express();
const server = createServer(app);

// ==================== Middleware ====================
// Parse requests
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: NODE_ENV === "production", // disable CSP in dev
  })
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);

// ==================== Routes ====================
registerRoutes(app);

// Dev mode: setup Vite middleware
if (NODE_ENV === "development") {
  setupVite(app, server).catch((err) => {
    console.error("⚠️ Failed to setup Vite middleware:", err);
    process.exit(1);
  });
}

// Prod mode: serve built client
if (NODE_ENV === "production") {
  serveStatic(app);
}

// ==================== Error Handling ====================
// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[server] Uncaught error:", err.stack || err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// ==================== Server Start ====================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
});
