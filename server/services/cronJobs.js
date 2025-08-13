import cron from 'node-cron';
import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import mongoose from 'mongoose';

const updateBookingsAndSlots = async () => {
  try {
    const now = new Date();
    
    const completedBookings = await Booking.find({
      endTime: { $lte: now },
      status: 'booked'
    });

    if (completedBookings.length > 0) {
      const slotIdsToUpdate = [];
      const bookingIdsToUpdate = [];

      for (const booking of completedBookings) {
        booking.status = 'completed';
        await booking.save();
        
        slotIdsToUpdate.push(booking.parkingSlot);
        bookingIdsToUpdate.push(booking._id);
      }

      await ParkingSlot.updateMany(
        { _id: { $in: slotIdsToUpdate } },
        { $set: { isAvailable: true, bookedBy: null, bookingTime: null } }
      );

      console.log(`[Cron Job] Successfully updated ${bookingIdsToUpdate.length} bookings to 'completed' and freed up ${slotIdsToUpdate.length} slots.`);
    }

  } catch (error) {
    console.error('[Cron Job] Error updating bookings and slots:', error);
  }
};

export const initScheduledJobs = () => {
  cron.schedule('*/10 * * * *', () => {
    updateBookingsAndSlots();
  });
};
