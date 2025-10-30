import express from 'express';
import {
  getAllParkingAreas,
  getParkingAreaDetails,
  bookSlot,
  getUserBookings,
  getUserBookingHistory,
  getSlotAvailability,
  addToFavorites,
  removeFromFavorites,
  getFavorites
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
router.get('/slots/:slotId/availability', auth, userAuth, getSlotAvailability);

// Favorites routes
router.post('/favorites/:parkingAreaId', auth, userAuth, addToFavorites);
router.delete('/favorites/:parkingAreaId', auth, userAuth, removeFromFavorites);
router.get('/favorites', auth, userAuth, getFavorites);

export default router;
