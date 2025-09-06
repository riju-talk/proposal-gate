import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";



// ---- Env & config ----------------------------------------------------------

const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD!;
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;
const SMTP_SECURE = true;
const EMAIL_FROM = process.env.EMAIL_FROM!;
const EMAIL_FROM_NAME = "Proposal Gate";

console.log(SMTP_USER)
console.log(SMTP_HOST)
console.log(SMTP_PASSWORD)
// ---- Transporter -----------------------------------------------------------

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
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
      from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text ?? htmlToText(html),
    });

    console.log("[mailer] Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[mailer] sendEmail error:", error);
    return false;
  }
}

// ---- Public API ------------------------------------------------------------

export const sendOtpEmail = async (
  email: string,
  otp: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const sent = await sendEmail({
      to: email,
      subject: "Your OTP Code for Proposal Gate",
      html: `
        <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto;">
          <h2>Your OTP Code</h2>
          <p>Your OTP code to login is:</p>
          <div style="font-size:24px; font-weight:bold; padding:20px; background:#f1f1f1; text-align:center; border-radius:4px;">
            ${escapeHtml(otp)}
          </div>
          <p><strong>Note:</strong> This OTP expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      `,
    });

    if (!sent) throw new Error("Failed to send OTP email");

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("[mailer] sendOtpEmail:", error);
    return { success: false, message: "Failed to send OTP email" };
  }
};

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
          ${safeComments ? `<p><strong>Admin Comments:</strong><br>${safeComments}</p>` : ""}
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
