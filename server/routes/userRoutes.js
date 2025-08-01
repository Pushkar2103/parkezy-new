import express from 'express';
import {
  getAllParkingAreas,
  getParkingAreaDetails,
  bookSlot,
  getUserBookings
} from '../controllers/userController.js';
import { auth, userAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/parking-areas', getAllParkingAreas);
router.get('/parking-areas/:id', getParkingAreaDetails);

router.post('/book-slot', auth, userAuth, bookSlot);
router.get('/bookings', auth, userAuth, getUserBookings);

export default router;
