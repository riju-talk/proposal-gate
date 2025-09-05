// server/auth.ts
import { Request, Response } from "express";
import { sendOTP, verifyOTP } from "./otp";
import { generateJWT } from "./jwt";

export const handleSendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const result = await sendOTP(email);

    if (result.success) {
      return res.json({ success: true, message: "OTP sent successfully" });
    } else {
      return res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error("Error in handleSendOTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const handleVerifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
    }

    const result = await verifyOTP(email, otp);

    if (result.success && result.admin) {
      // Generate JWT
      const token = generateJWT({
        userId: result.admin.email, // or admin.id if you add it later
        email: result.admin.email,
        name: result.admin.name,
        role: result.admin.role,
      });

      // Set as HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only HTTPS in prod
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24h
      });

      return res.json({
        success: true,
        message: "OTP verified successfully",
        admin: result.admin, // optional: you can return admin details for client UI
      });
    } else {
      return res.status(401).json({ success: false, error: result.error || "Invalid OTP" });
    }
  } catch (error) {
    console.error("Error in handleVerifyOTP:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
