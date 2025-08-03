import express from 'express';
import {
  getAllParkingAreas,
  getParkingAreaDetails,
  bookSlot,
  getUserBookings,
  getUserBookingHistory
} from '../controllers/userController.js';
import { auth, userAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/parking-areas', getAllParkingAreas);
router.get('/parking-areas/:id', getParkingAreaDetails);

// Protected user routes
router.post('/book-slot', auth, userAuth, bookSlot);
router.get('/bookings', auth, userAuth, getUserBookings);
router.get('/bookings/history', auth, userAuth, getUserBookingHistory);

export default router;
