import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateUserPassword
} from '../controllers/profileController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/me', getMyProfile);
router.put('/update-me', updateMyProfile);
router.put('/update-my-password', updateUserPassword);

export default router;
