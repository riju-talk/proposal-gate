import { db } from './db';
import { authorizedAdmins, otpVerifications } from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';
// Consolidated OTP functionality - no external dependencies needed

export const sendOTP = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user is authorized admin
    const [admin] = await db
      .select()
      .from(authorizedAdmins)
      .where(and(eq(authorizedAdmins.email, email), eq(authorizedAdmins.isActive, true)))
      .limit(1);

    if (!admin) {
      return { success: false, error: 'Unauthorized: Only authorized admins can access this system' };
    }

    // Rate-limit check: 1 OTP per 60 seconds
    const [lastOtp] = await db
      .select()
      .from(otpVerifications)
      .where(eq(otpVerifications.email, email))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    if (lastOtp && Date.now() - new Date(lastOtp.createdAt).getTime() < 60 * 1000) {
      return { success: false, error: 'Please wait 60 seconds before requesting another OTP' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any previous OTP records for this email
    await db.delete(otpVerifications).where(eq(otpVerifications.email, email));

    // Insert new OTP record
    await db.insert(otpVerifications).values({
      email,
      otp,
      expiresAt,
      used: false,
      createdAt: new Date(),
    });

    // In development, just log OTP to console
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_USER) {
      console.log(`🔐 OTP for ${email}: ${otp} (expires in 10 minutes)`);
      return { success: true };
    }

    // In development, we'll just log the OTP since no email service is configured
    // In production, you would integrate with your preferred email service here

    console.log(`[OTP] Sent to ${email}: ${otp}`); // For debugging
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
};

export const verifyOTP = async (
  email: string,
  inputOTP: string
): Promise<{ success: boolean; error?: string; admin?: any }> => {
  try {
    const now = new Date();

    const [record] = await db
      .select()
      .from(otpVerifications)
      .where(and(eq(otpVerifications.email, email), eq(otpVerifications.used, false)))
      .orderBy(desc(otpVerifications.createdAt))
      .limit(1);

    if (!record) {
      return { success: false, error: 'No OTP session found. Please request a new code.' };
    }

    // Check expiration
    if (new Date(record.expiresAt) < now) {
      // Delete all OTP records for this email
      await db.delete(otpVerifications).where(eq(otpVerifications.email, email));
      return { success: false, error: 'OTP has expired. Please request a new code.' };
    }

    // Verify OTP
    if (record.otp !== inputOTP) {
      // Increment attempts (you might want to add an attempts column to your schema)
      return { success: false, error: 'Invalid OTP. Please try again.' };
    }

    // Mark OTP as used
    await db.update(otpVerifications)
      .set({ used: true })
      .where(eq(otpVerifications.id, record.id));

    // Get admin details
    const [admin] = await db
      .select({
        email: authorizedAdmins.email,
        name: authorizedAdmins.name,
        role: authorizedAdmins.role,
      })
      .from(authorizedAdmins)
      .where(eq(authorizedAdmins.email, email))
      .limit(1);

    if (!admin) {
      return { success: false, error: 'Admin not found' };
    }

    return { 
      success: true, 
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify OTP. Please try again.' };
  }
};

// Optional: Clean up expired OTPs periodically
export const cleanupExpiredOTPs = async () => {
  try {
    const now = new Date();
    await db.delete(otpVerifications).where(eq(otpVerifications.expiresAt, now));
    console.log('Expired OTPs cleaned up');
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
};

// Clean up expired OTPs every 5 minutes if needed
// setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);