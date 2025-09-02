import { Router } from 'express';
import { z } from 'zod';
import { authenticateUser, validateRequest } from '../middleware/auth';
import * as userService from '../services/user';
import * as emailService from '../services/email';
import { generateToken } from '../utils/jwt';

const router = Router();

// Login user
router.post(
  '/login',
  validateRequest(
    z.object({
      email: z.string().email(),
      password: z.string(),
    })
  ),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await userService.loginUser(email, password);
      res.json(result);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: 'Invalid email or password' });
    }
  }
);

// Get current user
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Verify email
router.get(
  '/verify-email',
  validateRequest(
    z.object({
      token: z.string(),
    }).strict(),
    'query'
  ),
  async (req, res) => {
    try {
      const { token } = req.query;
      const decoded = verifyToken(token as string);
      
      // Mark email as verified
      await userService.verifyUserEmail(decoded.userId);
      
      // Redirect to success page or return success response
      res.redirect(`${process.env.FRONTEND_URL}/email-verified`);
    } catch (error) {
      console.error('Email verification error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/email-verification-failed`);
    }
  }
);

export default router;
