import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from './db';
import { authorizedAdmins } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface OTPSession {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory OTP storage (in production, use Redis or database)
const otpSessions = new Map<string, OTPSession>();

// Email transporter configuration
const createTransporter = () => {
  // Using Gmail SMTP (free tier)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  });
};

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authorized admin
    const admin = await db.select().from(authorizedAdmins).where(eq(authorizedAdmins.email, email)).limit(1);
    if (!admin.length || !admin[0].isActive) {
      return { success: false, error: 'Unauthorized: Only authorized admins can access this system' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP session
    otpSessions.set(email, {
      email,
      otp,
      expiresAt,
      attempts: 0
    });

    // Send email
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@studentcouncil.edu',
      to: email,
      subject: 'IIIT Delhi Student Council - Login OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">IIIT Delhi Student Council</h1>
            <p style="color: #6b7280; font-size: 16px;">Admin Portal Access</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #3b82f6, #1e40af); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <h2 style="color: white; margin-bottom: 15px;">Your Login Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 4px;">${otp}</span>
            </div>
            <p style="color: #e5e7eb; margin-top: 15px; font-size: 14px;">This code expires in 10 minutes</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <h3 style="color: #374151; margin-bottom: 10px;">Security Notice</h3>
            <ul style="color: #6b7280; margin: 0; padding-left: 20px;">
              <li>Never share this code with anyone</li>
              <li>This code is only valid for 10 minutes</li>
              <li>If you didn't request this code, please ignore this email</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">
              © 2025 IIIT Delhi Student Council. All rights reserved.
            </p>
          </div>
        </div>
      `
    };

    // In development, just log OTP to console instead of sending email
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER) {
      console.log(`🔐 OTP for ${email}: ${otp} (expires in 10 minutes)`);
    } else {
      await transporter.sendMail(mailOptions);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
};

export const verifyOTP = async (email: string, inputOTP: string): Promise<{ success: boolean; error?: string; admin?: any }> => {
  try {
    const session = otpSessions.get(email);
    
    if (!session) {
      return { success: false, error: 'No OTP session found. Please request a new code.' };
    }

    // Check expiration
    if (new Date() > session.expiresAt) {
      otpSessions.delete(email);
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }

    // Check attempts
    if (session.attempts >= 3) {
      otpSessions.delete(email);
      return { success: false, error: 'Too many failed attempts. Please request a new code.' };
    }

    // Verify OTP
    if (session.otp !== inputOTP) {
      session.attempts++;
      return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    // Success - get admin details
    const admin = await db.select().from(authorizedAdmins).where(eq(authorizedAdmins.email, email)).limit(1);
    otpSessions.delete(email); // Clean up session

    return { 
      success: true, 
      admin: admin.length ? {
        email: admin[0].email,
        name: admin[0].name,
        role: admin[0].role
      } : null
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify OTP. Please try again.' };
  }
};

export const cleanupExpiredOTPs = () => {
  const now = new Date();
  for (const [email, session] of otpSessions.entries()) {
    if (now > session.expiresAt) {
      otpSessions.delete(email);
    }
  }
};

// Clean up expired OTPs every 5 minutes
setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);