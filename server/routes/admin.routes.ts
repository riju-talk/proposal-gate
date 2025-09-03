import { Router } from 'express';
import { authenticateUser, authorizeRole } from '../middleware/auth';
import * as userService from '../services/user';

const router = Router();

// Get all admins
router.get('/admins', authenticateUser, async (req, res) => {
  try {
    const admins = await userService.getAdmins();
    res.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

export default router;
