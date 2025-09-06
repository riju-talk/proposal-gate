import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { ZodError } from 'zod';

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  errors?: Record<string, string>;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Default to 500 if status code not set
  const statusCode = err.statusCode || 500;
  
  // Log the error for debugging
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    name: err.name,
  });

  // Handle different types of errors
  if (err instanceof ZodError) {
    // Handle validation errors
    const formattedErrors: Record<string, string> = {};
    err.errors.forEach((error) => {
      const path = error.path.join('.');
      formattedErrors[path] = error.message;
    });

    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: formattedErrors,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }

  // Handle database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({
      status: 'error',
      message: 'Resource already exists',
    });
  }

  // Handle other errors
  const response: any = {
    status: 'error',
    message: err.message || 'Something went wrong',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};
