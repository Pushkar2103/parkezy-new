import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';

export const createBooking = async (req, res) => {
  try {
    const { userName, carNumber, parkingSlot, startTime, endTime } = req.body;

    if (!userName || !carNumber || !parkingSlot || !startTime || !endTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check for overlapping bookings
    const existing = await Booking.findOne({
      parkingSlot,
      isActive: true,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (existing) {
      return res.status(409).json({ message: 'Slot is already booked for the selected time' });
    }

    const booking = new Booking({
      userName,
      carNumber,
      parkingSlot,
      startTime,
      endTime
    });

    await booking.save();

    return res.status(201).json({ message: 'Booking created successfully', booking });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id

    const booking = await Booking.findByIdAndDelete(bookingId)
    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    // Free the slot
    await ParkingSlot.findByIdAndUpdate(booking.slotId, { isBooked: false })

    res.status(200).json({ message: 'Booking cancelled' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel' })
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { areaId, startTime, endTime } = req.query;

    if (!areaId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const allSlots = await ParkingSlot.find({ area: areaId });

    const bookedSlots = await Booking.find({
      parkingSlot: { $in: allSlots.map(slot => slot._id) },
      isActive: true,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    }).select('parkingSlot');

    const bookedSlotIds = bookedSlots.map(b => b.parkingSlot.toString());

    const availableSlots = allSlots.filter(
      slot => !bookedSlotIds.includes(slot._id.toString())
    );

    res.json({ availableSlots });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSlotAvailability = async (req, res) => {
  const { slotId } = req.params;
  const { startTime, endTime } = req.query;

  const bookings = await Booking.find({
    slot: slotId,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
    ],
  });

  res.status(200).json({
    available: bookings.length === 0
  });
};
