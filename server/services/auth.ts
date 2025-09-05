// server/auth.ts
import { Request, Response } from "express";
import { sendOTP, verifyOTP } from "./otp";
import { generateJWT } from "./jwt";

export const handleSendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const result = await sendOTP(email);
  if (result.success) {
    res.json({ success: true, message: "OTP sent" });
  } else {
    res.status(400).json({ error: result.error });
  }
};

export const handleVerifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });

  const result = await verifyOTP(email, otp);
  if (result.success && result.admin) {
    const token = generateJWT(result.admin);
    res.json({ success: true, token });
  } else {
    res.status(400).json({ error: result.error });
  }
};