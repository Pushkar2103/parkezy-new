import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import ParkingArea from '../models/ParkingArea.js';
import mongoose from 'mongoose';

// User requests to cancel a booking
export const requestCancellation = async (req, res) => {
  const { id } = req.params; // Booking ID
  const userId = req.user._id;

  try {
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
    }

    if (new Date() >= new Date(booking.startTime)) {
        return res.status(400).json({ message: 'Cannot request cancellation for a booking that has already started' });
    }
    
    if (booking.status !== 'booked') {
        return res.status(400).json({ message: `Cannot request cancellation for a booking with status: ${booking.status}` });
    }

    booking.status = 'cancellation_requested';
    await booking.save();

    res.status(200).json({ message: 'Cancellation request sent successfully. Awaiting owner approval.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while requesting cancellation', error: error.message });
  }
};

// Owner gets all cancellation requests for their parking areas
export const getCancellationRequests = async (req, res) => {
    const ownerId = req.user._id;

    try {
        const ownerParkingAreas = await ParkingArea.find({ ownerId }).select('_id');
        const areaIds = ownerParkingAreas.map(area => area._id);

        const slotsInOwnerAreas = await ParkingSlot.find({ areaId: { $in: areaIds } }).select('_id');
        const slotIds = slotsInOwnerAreas.map(slot => slot._id);

        const cancellationRequests = await Booking.find({ 
            parkingSlot: { $in: slotIds },
            status: 'cancellation_requested' 
        }).populate('parkingSlot').populate('userId', 'name email');

        res.status(200).json(cancellationRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching cancellation requests', error: error.message });
    }
};

// Owner responds to a cancellation request
export const respondToCancellation = async (req, res) => {
  const { id } = req.params; // Booking ID
  const { decision } = req.body; // 'approve' or 'deny'
  const ownerId = req.user._id;

  if (!['approve', 'deny'].includes(decision)) {
    return res.status(400).json({ message: "Invalid decision. Must be 'approve' or 'deny'." });
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(id).session(session);
    if (!booking) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Booking not found' });
    }

    const slot = await ParkingSlot.findById(booking.parkingSlot).populate('areaId').session(session);
    if (slot.areaId.ownerId.toString() !== ownerId.toString()) {
        await session.abortTransaction();
        return res.status(403).json({ message: 'You are not the owner of this parking area.' });
    }

    if (booking.status !== 'cancellation_requested') {
        await session.abortTransaction();
        return res.status(400).json({ message: `This booking is not awaiting cancellation. Current status: ${booking.status}`});
    }

    if (decision === 'approve') {
      booking.status = 'cancelled';
      slot.isAvailable = true;
      slot.bookedBy = null;
      slot.bookingTime = null;
      await slot.save({ session });
    } else { // 'deny'
      booking.status = 'booked';
    }

    await booking.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: `Cancellation request has been ${decision}d.`, booking });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error while responding to cancellation', error: error.message });
  } finally {
    session.endSession();
  }
};
