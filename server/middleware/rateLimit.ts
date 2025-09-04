import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from '../config';

// Rate limiting for OTP requests
const otpRateLimiter = new RateLimiterMemory({
  points: config.rateLimitMax,
  duration: config.rateLimitWindowMs / 1000, // Convert to seconds
  blockDuration: config.rateLimitWindowMs / 1000 * 2, // Block for 2x the window
});

export const otpRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  try {
    await otpRateLimiter.consume(clientIP);
    next();
  } catch (rateLimiterRes) {
    const retryAfter = Math.ceil((rateLimiterRes as any).msBeforeNext / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({
      error: 'Too many requests',
      message: `Too many OTP requests. Please try again after ${retryAfter} seconds.`,
    });
  }
};

// Rate limiting for OTP verification
const verifyRateLimiter = new RateLimiterMemory({
  points: 10, // Allow more attempts for verification
  duration: 3600, // 1 hour in seconds
  blockDuration: 3600, // Block for 1 hour after too many attempts
});

export const verifyRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  try {
    await verifyRateLimiter.consume(email);
    next();
  } catch (rateLimiterRes) {
    res.status(429).json({
      error: 'Too many attempts',
      message: 'Too many verification attempts. Please try again later.',
    });
  }
};

// Security headers middleware
export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data:; " +
      "font-src 'self'; " +
      "connect-src 'self'"
    );
  }
  
  // Prevent caching of sensitive data
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
  
  next();
};
