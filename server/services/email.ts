// server/email.ts
import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { generateAuthToken } from "./jwt";

// ---- Env & config ----------------------------------------------------------
const {
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = "587",
  SMTP_SECURE = "false",
  EMAIL_FROM,
  EMAIL_FROM_NAME = "Proposal Gate",
  APP_URL,
  NODE_ENV = "development",
} = process.env;

const requiredEnvVars = ["SMTP_USER", "SMTP_PASSWORD", "EMAIL_FROM", "APP_URL"] as const;
const missing = requiredEnvVars.filter((k) => !process.env[k]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

const isProd = NODE_ENV === "production";
const portNum = Number(SMTP_PORT);
const secure = SMTP_SECURE === "true" || portNum === 465;

// ---- Transporter -----------------------------------------------------------
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: portNum,
  secure,
  auth: {
    user: SMTP_USER!,
    pass: SMTP_PASSWORD!,
  },
  ...(isProd ? {} : { tls: { rejectUnauthorized: false } }),
} as SMTPTransport.Options);

transporter.verify().then(
  () => console.log("[mailer] SMTP connection OK"),
  (err) => console.warn("[mailer] SMTP verify failed:", err?.message || err)
);

// ---- Helpers ---------------------------------------------------------------
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function escapeHtml(s = ""): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM!}>`,
      to,
      subject,
      html,
      text: text ?? htmlToText(html),
    });

    if (!isProd) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("[mailer] Preview URL:", preview);
      else console.log("[mailer] Message sent:", info.messageId);
    }

    return true;
  } catch (error) {
    console.error("[mailer] sendEmail error:", error);
    return false;
  }
}

// ---- Public API ------------------------------------------------------------

/**
 * Send verification email
 * Caller must provide user info (id, email, role)
 */
export const sendVerificationEmail = async (
  user: { id: string; email: string; name?: string; role: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    const token = generateAuthToken(user);

    const verificationUrl = `${APP_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const sent = await sendEmail({
      to: user.email,
      subject: "Verify Your Email Address",
      html: `
        <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto;">
          <h2>Welcome to ${escapeHtml(EMAIL_FROM_NAME)}</h2>
          <p>Please verify your email address by clicking the button below:</p>
          <div style="margin:30px 0; text-align:center;">
            <a href="${verificationUrl}"
               style="background:#4CAF50; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px; font-weight:bold;">
              Verify Email
            </a>
          </div>
          <p>Or copy this link:</p>
          <p style="word-break:break-all;">${verificationUrl}</p>
          <p><strong>Note:</strong> This link expires in 24 hours.</p>
        </div>
      `,
    });

    if (!sent) throw new Error("Failed to send verification email");

    return { success: true, message: "Verification email sent" };
  } catch (error) {
    console.error("[mailer] sendVerificationEmail:", error);
    return { success: false, message: "Failed to send verification email" };
  }
};

/**
 * Send event status update email
 */
export const sendEventStatusUpdateEmail = async (
  email: string,
  eventName: string,
  status: "pending" | "approved" | "rejected",
  comments?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const statusText = status.charAt(0).toUpperCase() + status.slice(1);
    const color = status === "approved" ? "#4CAF50" : status === "rejected" ? "#f44336" : "#2196F3";
    const safeComments = comments ? escapeHtml(comments).replace(/\n/g, "<br>") : "";

    const sent = await sendEmail({
      to: email,
      subject: `Event Status Update: ${eventName} - ${statusText}`,
      html: `
        <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto;">
          <h2>Event Status Update: ${escapeHtml(eventName)}</h2>
          <p>Status updated to: <strong style="color:${color};">${statusText}</strong></p>
          ${
            safeComments
              ? `<div style="background:#f8f9fa; padding:15px; border-left:4px solid #6c757d; margin:15px 0;">
                  <p style="margin:0; font-style:italic;">${safeComments}</p>
                </div>`
              : ""
          }
          <p>You can view more details here:</p>
          <div style="margin:30px 0; text-align:center;">
            <a href="${APP_URL}/dashboard"
               style="background:#4CAF50; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px; font-weight:bold;">
              View Dashboard
            </a>
          </div>
        </div>
      `,
    });

    if (!sent) throw new Error("Failed to send event status update email");

    return { success: true, message: "Event status update email sent successfully" };
  } catch (error) {
    console.error("[mailer] sendEventStatusUpdateEmail:", error);
    return { success: false, message: "Failed to send event status update email" };
  }
};
