import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { profiles } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Verify user exists in database
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, decoded.email))
      .limit(1);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error instanceof Error) {
      return res.status(401).json({ error: `Unauthorized: ${error.message}` });
    }
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

export const authorizeRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    // Verify user exists in database
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, decoded.email))
      .limit(1);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    }
  } catch (error) {
    // If token is invalid, just continue without user
    console.error('Optional auth error:', error);
  }
  
  next();
};

export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        ...req.body,
        ...req.params,
        ...req.query,
      });
      
      // Replace the request body with validated data
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
