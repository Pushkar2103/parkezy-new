import express from 'express';
import {
  createParkingArea,
  getOwnerParkingAreas,
  updateParkingArea,
  deleteParkingArea,
  getOwnerDashboardStats 
} from '../controllers/parkingController.js';
import { ownerAuth } from '../middlewares/authMiddleware.js';
import { uploadParkingImage } from '../middlewares/multerConfig.js';

const router = express.Router();

router.post('/', ownerAuth, uploadParkingImage.single('parkingImage'), createParkingArea);
router.get('/owner', ownerAuth, getOwnerParkingAreas);
router.put('/:id', ownerAuth, uploadParkingImage.single('parkingImage'), updateParkingArea);
router.delete('/:id', ownerAuth, deleteParkingArea);

router.get('/owner/stats', ownerAuth, getOwnerDashboardStats);

export default router;
