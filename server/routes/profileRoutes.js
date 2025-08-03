import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  updateUserPassword,
  uploadProfilePicture
} from '../controllers/profileController.js';
import { auth } from '../middlewares/authMiddleware.js';
import {uploadProfilePic} from '../middlewares/multerConfig.js';

const router = express.Router();

router.use(auth);

router.get('/me', getMyProfile);
router.put('/update-me', updateMyProfile);
router.put('/update-my-password', updateUserPassword);
router.post('/upload-picture', uploadProfilePic.single('profilePic'), uploadProfilePicture);

export default router;
