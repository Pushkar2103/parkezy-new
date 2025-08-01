import express from 'express';
import {
  createParkingArea,
  getOwnerParkingAreas,
  updateParkingArea,
  deleteParkingArea,
  getOwnerDashboardStats // Import new function
} from '../controllers/parkingController.js';
import { ownerAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', ownerAuth, createParkingArea);
router.get('/owner', ownerAuth, getOwnerParkingAreas);
router.put('/:id', ownerAuth, updateParkingArea);
router.delete('/:id', ownerAuth, deleteParkingArea);

router.get('/owner/stats', ownerAuth, getOwnerDashboardStats);

export default router;
