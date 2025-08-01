import cron from 'node-cron';
import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import mongoose from 'mongoose';

const updateBookingsAndSlots = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const now = new Date();
    
    const completedBookings = await Booking.find({
      endTime: { $lte: now },
      status: 'booked'
    }).session(session);

    if (completedBookings.length > 0) {
      const slotIdsToUpdate = [];
      const bookingIdsToUpdate = [];

      for (const booking of completedBookings) {
        booking.status = 'completed';
        await booking.save({ session });
        
        slotIdsToUpdate.push(booking.parkingSlot);
        bookingIdsToUpdate.push(booking._id);
      }

      await ParkingSlot.updateMany(
        { _id: { $in: slotIdsToUpdate } },
        { $set: { isAvailable: true, bookedBy: null, bookingTime: null } }
      ).session(session);

      console.log(`[Cron Job] Successfully updated ${bookingIdsToUpdate.length} bookings to 'completed' and freed up ${slotIdsToUpdate.length} slots.`);
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    console.error('[Cron Job] Error updating bookings and slots:', error);
  } finally {
    session.endSession();
  }
};

export const initScheduledJobs = () => {
  cron.schedule('*/10 * * * *', () => {
    console.log('[Cron Job] Running job to update completed bookings...');
    updateBookingsAndSlots();
  });
};
