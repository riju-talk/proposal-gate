import { randomInt } from 'crypto';
import { addMinutes, isAfter } from 'date-fns';
import { db } from '../db';
import { otpVerifications } from '@shared/schema';
import { and, eq, gte } from 'drizzle-orm';

const OTP_EXPIRY_MINUTES = 15;
const OTP_LENGTH = 6;

/**
 * Generate a random OTP code
 */
export const generateOTP = (): string => {
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return randomInt(min, max).toString();
};

/**
 * Create a new OTP for the given email
 */
export const createOTP = async (email: string) => {
  const otp = generateOTP();
  const expiresAt = addMinutes(new Date(), OTP_EXPIRY_MINUTES);

  // Invalidate any existing OTPs for this email
  await db
    .update(otpVerifications)
    .set({ used: true })
    .where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.used, false),
        gte(otpVerifications.expiresAt, new Date())
      )
    );

  // Create new OTP
  const [newOtp] = await db
    .insert(otpVerifications)
    .values({
      email,
      otp,
      expiresAt,
    })
    .returning();

  return newOtp;
};

/**
 * Verify if the provided OTP is valid for the given email
 */
export const verifyOTP = async (email: string, otp: string) => {
  const [otpRecord] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.otp, otp),
        eq(otpVerifications.used, false),
        gte(otpVerifications.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!otpRecord) {
    return { isValid: false, message: 'Invalid or expired OTP' };
  }

  // Mark OTP as used
  await db
    .update(otpVerifications)
    .set({ used: true })
    .where(eq(otpVerifications.id, otpRecord.id));

  return { isValid: true, message: 'OTP verified successfully' };
};

/**
 * Check if an OTP request is allowed (rate limiting)
 */
export const isOTPRequestAllowed = async (email: string): Promise<{ allowed: boolean; timeLeft?: number }> => {
  const recentOTP = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.used, false),
        gte(otpVerifications.expiresAt, new Date())
      )
    )
    .orderBy(otpVerifications.createdAt)
    .limit(1);

  if (recentOTP.length === 0) {
    return { allowed: true };
  }

  const otp = recentOTP[0];
  const now = new Date();
  const lastRequestTime = otp.createdAt;
  const timeSinceLastRequest = now.getTime() - lastRequestTime.getTime();
  const cooldownPeriod = 60 * 1000; // 1 minute cooldown

  if (timeSinceLastRequest < cooldownPeriod) {
    return {
      allowed: false,
      timeLeft: Math.ceil((cooldownPeriod - timeSinceLastRequest) / 1000),
    };
  }

  return { allowed: true };
};
