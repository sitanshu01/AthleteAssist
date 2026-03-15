import { Router } from 'express';
import { login, signup, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/signup', signup);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;
