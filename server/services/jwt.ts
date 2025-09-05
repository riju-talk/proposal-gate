// server/jwt.ts
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is required");

export interface JwtPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  type?: string; // e.g., "password_reset"
}

// Generate a JWT
export const generateJWT = (
  payload: JwtPayload,
  expiresIn: number | `${number}s` | `${number}m` | `${number}h` | `${number}d` | `${number}y` = '24h'
): string => {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET, options);
};

// Verify a JWT
export const verifyJWT = (token: string): JwtPayload | null => {
  try {
    const options: VerifyOptions = {};
    return jwt.verify(token, JWT_SECRET, options) as JwtPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

// Helper: Auth token
export const generateAuthToken = (user: {
  id: string;
  email: string;
  name?: string;
  role: string;
}): string => {
  return generateJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
};

