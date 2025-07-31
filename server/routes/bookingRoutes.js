import express from 'express'
import { createBooking, cancelBooking, getAvailableSlots, getSlotAvailability } from '../controllers/bookingController.js'

const router = express.Router()

router.post('/', createBooking)
router.delete('/:id', cancelBooking)
router.get('/available', getAvailableSlots);
router.get('/availability/:slotId', getSlotAvailability);

export default router