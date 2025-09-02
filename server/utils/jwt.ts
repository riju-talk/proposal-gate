import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Token payload schema
export const tokenSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  iat: z.number(),
  exp: z.number(),
});

export type TokenPayload = z.infer<typeof tokenSchema>;

// Generate a new JWT token
export const generateToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Generate a token for session (simpler payload)
export const generateSessionToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify and parse a JWT token
export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return tokenSchema.parse(decoded);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Failed to verify token');
  }
};

// Verify a session token (simpler verification)
export const verifySessionToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { userId: (decoded as any).userId };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid session token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Session expired');
    }
    throw new Error('Failed to verify session');
  }
};
