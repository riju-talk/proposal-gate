import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  email: string;
  id: string;
  role: string;
  name?: string;
  approvalOrder: number;
  iat?: number;
  exp?: number;
}

export function generateJWT(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export function setAuthCookies(res: any, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: config.jwtCookieMaxAge,
    path: '/',
  });
}

export function clearAuthCookies(res: any) {
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
}
