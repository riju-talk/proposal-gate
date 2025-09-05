import { db } from "../db";
import { otpVerifications, authorizedAdmins } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Generate 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
export const sendOTP = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  // Check if email exists in authorized_admins and is active
  const [admin] = await db
    .select()
    .from(authorizedAdmins)
    .where(and(eq(authorizedAdmins.email, email), eq(authorizedAdmins.isActive, true)))
    .limit(1);

  if (!admin) {
    return { success: false, error: "Email not authorized" };
  }

  // Check last OTP request (rate limit: 1 OTP per 60 seconds)
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
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate existing OTPs (mark as used)
  await db
    .update(otpVerifications)
    .set({ used: true })
    .where(eq(otpVerifications.email, email));

  // Insert new OTP
  await db.insert(otpVerifications).values({
    email,
    otp,
    expiresAt,
  });

  // TODO: Replace with Nodemailer/Resend in prod
  console.log(`OTP for ${email}: ${otp}`);

  return { success: true };
};

// Verify OTP
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
    return { success: false, error: "OTP not found" };
  }

  if (new Date(record.expiresAt) < now) {
    // Expire this OTP
    await db
      .update(otpVerifications)
      .set({ used: true })
      .where(eq(otpVerifications.id, record.id));
    return { success: false, error: "OTP expired" };
  }

  if (record.otp !== otp) {
    return { success: false, error: "Invalid OTP" };
  }

  // ✅ Mark OTP as used
  await db
    .update(otpVerifications)
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
    return { success: false, error: "Admin not found" };
  }

  return { success: true, admin };
};
