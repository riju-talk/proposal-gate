// server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyJWT } from "../services/jwt";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }

  (req as any).user = decoded;
  next();
};