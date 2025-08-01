import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateUserPassword
} from '../controllers/profileController.js';
import { ownerAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(ownerAuth);

router.get('/me', getMyProfile);
router.put('/update-me', updateMyProfile);
router.put('/update-my-password', updateUserPassword);

export default router;
