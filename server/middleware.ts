import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { verifyJWT } from './jwt';

// Rate limiting for OTP requests
export const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message: { error: 'Too many OTP requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for OTP verification
export const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: { error: 'Too many verification attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  }),
  cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://your-domain.com'] 
      : ['http://localhost:5000', 'http://localhost:8080', 'http://localhost:3000'],
    credentials: true,
  }),
];

// Admin authentication middleware using JWT from HTTP-only cookies
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }
    
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        name: string;
        role: string;
      };
    }
  }
}