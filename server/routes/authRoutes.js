import express from 'express';
import { register, login, forgotPassword, resetPassword, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);

router.get('/verify-email/:token', verifyEmail);

export default router;
