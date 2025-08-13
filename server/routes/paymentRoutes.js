import express from 'express';
import { initiatePayment, verifyPayment, cashfreeWebhook } from '../controllers/paymentController.js';
import { auth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(auth);

router.post('/create-order', initiatePayment);
router.post('/verify', verifyPayment);
router.post('/webhook', express.json({ type: '*/*' }), cashfreeWebhook);

export default router;
