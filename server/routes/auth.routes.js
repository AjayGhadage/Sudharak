import express from 'express';
import { register, login, googleOAuth, getMe, checkEmailExists, forgotPassword, verifyOtp, resetPassword } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleOAuth);
router.post('/check-email', checkEmailExists);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);

export default router;

