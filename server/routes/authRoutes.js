import express from 'express';
import {
  register,
  login,
  logout,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleStart,
  googleCallback,
} from '../controllers/authController.js';
import { requireCustomer, rateLimit } from '../middleware/customerAuth.js';

const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, bucket: 'auth', message: 'Too many attempts. Please wait a few minutes and try again.' });
const strictLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, bucket: 'auth-strict', message: 'Too many attempts. Please try again later.' });

router.post('/register', strictLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireCustomer, me);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', strictLimiter, forgotPassword);
router.post('/reset-password', strictLimiter, resetPassword);

router.get('/google', googleStart);
router.get('/google/callback', googleCallback);

export default router;
