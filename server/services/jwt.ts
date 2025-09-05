// server/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is required");

export const generateJWT = (admin: { email: string; name: string; role: string }): string => {
  return jwt.sign(
    { email: admin.email, name: admin.name, role: admin.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const verifyJWT = (token: string): { email: string; name: string; role: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
};