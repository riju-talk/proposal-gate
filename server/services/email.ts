git import nodemailer from 'nodemailer';
import { generateToken } from '../utils/jwt';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { profiles } from '@shared/schema';

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@proposalgate.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Create a test account if in development
let transporter: nodemailer.Transporter;

if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
} else {
  // Use ethereal.email for testing
  (async () => {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();
}

export const sendVerificationEmail = async (email: string) => {
  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate verification token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const verificationUrl = `${APP_URL}/verify-email?token=${token}`;

    // Send verification email
    const info = await transporter.sendMail({
      from: `"ProposalGate" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ProposalGate!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    // Check if user exists
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    if (!user) {
      // Don't reveal that the email doesn't exist
      return { success: true };
    }

    // Generate password reset token (expires in 1 hour)
    const token = generateToken(
      { userId: user.id, email: user.email, role: user.role },
      '1h'
    );

    const resetUrl = `${APP_URL}/reset-password?token=${token}`;

    // Send password reset email
    const info = await transporter.sendMail({
      from: `"ProposalGate" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendEventStatusUpdateEmail = async (
  email: string,
  eventName: string,
  status: string,
  comments?: string
) => {
  try {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    
    await transporter.sendMail({
      from: `"ProposalGate" <${EMAIL_FROM}>`,
      to: email,
      subject: `Event Update: ${eventName} - ${statusText}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Event Status Update: ${eventName}</h2>
          <p>The status of your event "${eventName}" has been updated to: 
            <strong>${statusText}</strong>
          </p>
          ${comments ? `<p><strong>Comments:</strong><br>${comments}</p>` : ''}
          <p>You can view the updated status by logging into your account.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${APP_URL}/dashboard" 
               style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              View Dashboard
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">
            This is an automated message, please do not reply directly to this email.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending event status update email:', error);
    throw new Error('Failed to send event status update email');
  }
};
