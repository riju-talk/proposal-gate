import { z } from 'zod';

// Authentication validations
export const requestOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

// User validations
export const userProfileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['user', 'admin']).default('user'),
});

export const updateProfileSchema = userProfileSchema.partial();

export const approvalSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  comments: z.string().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().int().positive(),
  buffer: z.instanceof(Buffer),
});

// Query params validations
export const eventQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  organizerEmail: z.string().email('Invalid email format').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

export const adminActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  comments: z.string().optional(),
});
