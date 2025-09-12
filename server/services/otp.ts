import { db } from "../db";
import { otpVerifications, authorizedAdmins } from "../../shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendOtpEmail } from "./email"; // Make sure this is the proper method to send OTP emails

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP function
export const sendOTP = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  // Verify authorized admin
  const [admin] = await db
    .select()
    .from(authorizedAdmins)
    .where(and(eq(authorizedAdmins.email, email), eq(authorizedAdmins.isActive, true)))
    .limit(1);

  if (!admin) {
    return { success: false, error: "Email not authorized" };
  }

  // Rate-limit check: 1 OTP per 60 seconds
  const [lastOtp] = await db
    .select()
    .from(otpVerifications)
    .where(eq(otpVerifications.email, email))
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  if (lastOtp && Date.now() - new Date(lastOtp.createdAt).getTime() < 60 * 1000) {
    return { success: false, error: "Please wait before requesting another OTP" };
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

  // Delete any previous OTP records for this email
  await db.delete(otpVerifications).where(eq(otpVerifications.email, email));

  // Insert new OTP record
  await db.insert(otpVerifications).values({
    email,
    otp,
    expiresAt,
    used: false,
  });

  // Send OTP Email
  const mailResult = await sendOtpEmail(email, otp);

  if (!mailResult.success) {
    return { success: false, error: mailResult.message || "Failed to send OTP email" };
  }

  console.log(`[OTP] Sent to ${email}: ${otp}`); // For debugging

  return { success: true };
};

// Verify OTP function
export const verifyOTP = async (
  email: string,
  otp: string
): Promise<{
  success: boolean;
  error?: string;
  admin?: { email: string; name: string; role: string };
}> => {
  const now = new Date();

  const [record] = await db
    .select()
    .from(otpVerifications)
    .where(and(eq(otpVerifications.email, email), eq(otpVerifications.used, false)))
    .orderBy(desc(otpVerifications.createdAt))
    .limit(1);

  if (!record) {
    return { success: false, error: "OTP not found or already used" };
  }

  if (new Date(record.expiresAt) < now) {
    // Delete all OTP records for safety
    await db.delete(otpVerifications).where(eq(otpVerifications.email, email));
    return { success: false, error: "OTP expired" };
  }

  if (record.otp !== otp) {
    return { success: false, error: "Invalid OTP" };
  }

  // Valid OTP: Delete all OTP records for that email
  await db.delete(otpVerifications).where(eq(otpVerifications.email, email));

  // Fetch the admin details
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
    return { success: false, error: "Admin not found" };
  }

  return { success: true, admin };
};
