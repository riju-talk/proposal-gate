// server/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyJWT, JwtPayload } from "../services/jwt"; // adjust import path if needed


// Helper: extract Bearer token
function extractBearer(req: Request): string | null {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim();
}

// Authentication middleware
export const requireAuth = (roles?: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.token || extractBearer(req);
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      const decoded = verifyJWT(token) as JwtPayload | null;
      if (!decoded) {
        return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
      }

      if (roles && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient role" });
      }

      (req as any).user = decoded;
      next();
    } catch (err) {
      console.error("[auth middleware] Error verifying token:", err);
      return res.status(500).json({ error: "Internal authentication error" });
    }
  };
};
