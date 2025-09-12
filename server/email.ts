import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_HOST = "smtp.gmail.com";
const SMTP_PORT = 465;

// Create transporter only if SMTP credentials are available
const transporter = SMTP_USER && SMTP_PASSWORD
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: true,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    })
  : null;

// Verify connection if transporter exists
if (transporter) {
  transporter.verify().then(
    () => console.log("[mailer] SMTP connection OK"),
    (err) => console.warn("[mailer] SMTP verify failed:", err?.message || err)
  );
}

// Simple email sending function
export async function sendEmail(to: string, content: { subject: string; html: string }): Promise<boolean> {
  // If no SMTP configured, log to console and return true (simulated success)
  if (!transporter) {
    const textContent = content.html.replace(/<[^>]*>/g, "").replace(/\s{2,}/g, " ");
    console.log(`[Email Simulated] To: ${to}, Subject: ${content.subject}, Body: ${textContent}`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_USER,
      to,
      subject: content.subject,
      html: content.html,
      text: content.html.replace(/<[^>]*>/g, "").replace(/\s{2,}/g, " "),
    });

    console.log("[mailer] Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("[mailer] sendEmail error:", error);
    return false;
  }
}