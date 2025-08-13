import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import ParkingArea from '../models/ParkingArea.js';

export const requestCancellation = async (req, res) => {
  const { id } = req.params;
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

    res.status(200).json({
      message: 'Cancellation request sent successfully. Awaiting owner approval.',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while requesting cancellation', error: error.message });
  }
};

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

export const respondToCancellation = async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;
  const ownerId = req.user._id;

  if (!['approve', 'deny'].includes(decision)) {
    return res.status(400).json({ message: "Invalid decision. Must be 'approve' or 'deny'." });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const slot = await ParkingSlot.findById(booking.parkingSlot).populate('areaId');
    if (!slot || !slot.areaId) {
      return res.status(404).json({ message: 'Associated parking slot or area not found.' });
    }

    if (slot.areaId.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this parking area.' });
    }
    if (booking.status !== 'cancellation_requested') {
      return res.status(400).json({ message: `This booking is not awaiting cancellation. Current status: ${booking.status}` });
    }

    if (decision === 'approve') {
      booking.status = 'cancelled';
      slot.isAvailable = true;
      slot.bookedBy = null;
      slot.bookingTime = null;

      if (booking.amountPaid > 0) {
        booking.paymentStatus = 'refunded';
      }

      await slot.save();
    } else {
      booking.status = 'booked';
    }

    await booking.save();
    res.status(200).json({ message: `Cancellation request has been ${decision}d.`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while responding to cancellation', error: error.message });
  }
};

export const requestCompletion = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.userId.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });

    const now = new Date();
    if (now < new Date(booking.startTime) || now > new Date(booking.endTime)) {
      return res.status(400).json({ message: 'This booking is not currently active.' });
    }
    if (booking.status !== 'booked') {
      return res.status(400).json({ message: `Cannot request completion for a booking with status: ${booking.status}` });
    }

    booking.status = 'completion_requested';
    await booking.save();
    res.status(200).json({ message: 'Completion request sent successfully.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while requesting completion', error: error.message });
  }
};

export const getCompletionRequests = async (req, res) => {
  const ownerId = req.user._id;
  try {
    const ownerParkingAreas = await ParkingArea.find({ ownerId }).select('_id');
    const areaIds = ownerParkingAreas.map(area => area._id);
    const slotsInOwnerAreas = await ParkingSlot.find({ areaId: { $in: areaIds } }).select('_id');
    const slotIds = slotsInOwnerAreas.map(slot => slot._id);
    const completionRequests = await Booking.find({
      parkingSlot: { $in: slotIds },
      status: 'completion_requested'
    }).populate('parkingSlot').populate('userId', 'name email');

    res.status(200).json(completionRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching completion requests', error: error.message });
  }
};

export const respondToCompletion = async (req, res) => {
  const { id } = req.params;
  const { decision } = req.body;
  const ownerId = req.user._id;

  if (!['approve', 'deny'].includes(decision)) {
    return res.status(400).json({ message: "Invalid decision. Must be 'approve' or 'deny'." });
  }

  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const slot = await ParkingSlot.findById(booking.parkingSlot).populate('areaId');
    if (!slot || !slot.areaId) {
      return res.status(404).json({ message: 'Associated parking slot or area not found.' });
    }

    if (slot.areaId.ownerId.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: 'You are not the owner of this parking area.' });
    }
    if (booking.status !== 'completion_requested') {
      return res.status(400).json({ message: `This booking is not awaiting completion. Current status: ${booking.status}` });
    }

    if (decision === 'approve') {
      booking.status = 'completed';
      slot.isAvailable = true;
      slot.bookedBy = null;
      slot.bookingTime = null;
      await slot.save();
    } else {
      booking.status = 'booked';
    }

    await booking.save();
    res.status(200).json({ message: `Completion request has been ${decision}d.`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error while responding to completion', error: error.message });
  }
};
