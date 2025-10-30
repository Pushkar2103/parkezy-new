import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const getAllParkingAreas = async (req, res) => {
  const { search } = req.query;
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng) : null;
  const radius = req.query.radius ? parseFloat(req.query.radius) : 10;
  const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
  const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
  const parkingType = req.query.parkingType; // 'covered', 'open-air', 'mixed'
  const evCharging = req.query.evCharging === 'true'; // boolean
  const securityFeatures = req.query.securityFeatures; // comma-separated: "cctv,lighting"
  const vehicleType = req.query.vehicleType; // single value: 'car', 'bike', etc.

  try {
    // Build filter object
    const filter = {};

    // Price range filter
    if (minPrice !== null || maxPrice !== null) {
      filter.pricePerHour = {};
      if (minPrice !== null) filter.pricePerHour.$gte = minPrice;
      if (maxPrice !== null) filter.pricePerHour.$lte = maxPrice;
    }

    // Parking type filter
    if (parkingType && ['covered', 'open-air', 'mixed'].includes(parkingType)) {
      filter.parkingType = parkingType;
    }

    // EV charging filter
    if (req.query.evCharging) {
      filter.evCharging = evCharging;
    }

    // Security features filter (all selected must be present)
    if (securityFeatures) {
      const features = securityFeatures.split(',');
      features.forEach(feature => {
        if (['cctv', 'securityGuard', 'gatedAccess', 'lighting'].includes(feature)) {
          filter[`securityFeatures.${feature}`] = true;
        }
      });
    }

    // Vehicle type filter
    if (vehicleType && ['bike', 'car', 'compact-suv', 'full-suv', 'truck'].includes(vehicleType)) {
      filter.vehicleTypes = vehicleType;
    }

    const allParkingAreas = await ParkingArea.find(filter).populate('locationId');
    if (!allParkingAreas.length) return res.status(200).json([]);

    const augmentedAreas = await Promise.all(allParkingAreas.map(async (area) => {
      const availableSlots = await ParkingSlot.countDocuments({
        areaId: area._id,
        status: { $regex: /^available$/i } // case-insensitive match
      });

      return {
        _id: area._id,
        name: area.name,
        image: area.image,
        totalSlots: area.totalSlots,
        availableSlots,
        pricePerHour: area.pricePerHour,
        parkingType: area.parkingType,
        evCharging: area.evCharging,
        securityFeatures: area.securityFeatures,
        vehicleTypes: area.vehicleTypes,
        location: area.locationId
      };
    }));

    let nearbyAreas = augmentedAreas;
    if (lat && lng) {
      nearbyAreas = augmentedAreas
        .map(area => {
          const coords = area.location?.coordinates?.coordinates;
          if (!coords || coords.length !== 2) return null;
          const distance = getDistance(lat, lng, coords[1], coords[0]);
          return { ...area, distance };
        })
        .filter(area => area && area.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    let finalResults = nearbyAreas;
    if (search) {
      const q = search.toLowerCase();
      finalResults = nearbyAreas.filter(area =>
        area.name.toLowerCase().includes(q) ||
        (area.location?.name?.toLowerCase().includes(q)) ||
        (area.location?.city?.toLowerCase().includes(q))
      );
    }

    const resultsForFrontend = finalResults.map(area => {
      const coords = area.location?.coordinates?.coordinates;
      if (!coords) return null;
      return {
        ...area,
        location: {
          _id: area.location._id,
          name: area.location.name,
          city: area.location.city,
          coordinates: {
            lat: coords[1],
            lng: coords[0]
          }
        }
      };
    }).filter(Boolean);

    res.status(200).json(resultsForFrontend);
  } catch (error) {
    console.error("Error in getAllParkingAreas:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getParkingAreaDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const parkingArea = await ParkingArea.findById(id).populate('locationId');
    if (!parkingArea) return res.status(404).json({ message: 'Parking area not found' });

    const slots = await ParkingSlot.find({ areaId: id });
    res.status(200).json({ area: parkingArea, slots });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const bookSlot = async (req, res) => {
  const { slotId, carNumber, startTime, endTime, amountPaid } = req.body;
  const userId = req.user._id;

  if (!slotId || !carNumber || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing booking details.' });
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (start < now) {
    return res.status(400).json({ message: 'Booking start time cannot be in the past.' });
  }
  if (end <= start) {
    return res.status(400).json({ message: 'Booking end time must be after the start time.' });
  }

  try {
    const slot = await ParkingSlot.findById(slotId);

    if (!slot) {
      return res.status(404).json({ message: 'Parking slot not found.' });
    }

    if (slot.status !== 'pending') {
      return res.status(400).json({ message: 'Slot is not reserved for booking.' });
    }

    slot.status = 'booked';
    slot.bookedBy = userId;
    slot.bookingTime = new Date();
    await slot.save();

    const newBooking = new Booking({
      carNumber,
      userId,
      parkingSlot: slotId,
      startTime,
      endTime,
      status: 'booked',
      amountPaid: amountPaid || 0,
      paymentStatus: amountPaid > 0 ? 'paid' : null
    });

    await newBooking.save();

    res.status(201).json({ message: 'Booking confirmed!', booking: newBooking });
  } catch (error) {
    console.error("Error in bookSlot:", error);
    res.status(500).json({ message: 'Server error while confirming booking', error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user._id,
      status: { $nin: ['completed', 'cancelled'] }
    })
    .populate({
      path: 'parkingSlot',
      populate: { path: 'areaId', populate: { path: 'locationId' } }
    })
    .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserBookingHistory = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      userId: req.user._id,
      status: { $in: ['completed', 'cancelled'] }
    })
    .populate({
      path: 'parkingSlot',
      populate: { path: 'areaId', populate: { path: 'locationId' } }
    })
    .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getSlotAvailability = async (req, res) => {
  try {
    const { slotId } = req.params;
    const slot = await ParkingSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found.' });

    res.status(200).json({ 
      isAvailable: /^available$/i.test(slot.status),
      areaId: slot.areaId 
    });
  } catch (error) {
    console.error("Error in getSlotAvailability:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

setInterval(async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const stuckSlots = await ParkingSlot.find({
      status: 'pending',
      bookingTime: { $lt: tenMinutesAgo }
    });

    for (const slot of stuckSlots) {
      const booking = await Booking.findOne({
        parkingSlot: slot._id,
        paymentStatus: 'pending'
      });

      if (booking) {
        booking.status = 'cancelled';
        await booking.save();
      }

      slot.status = 'available';
      slot.bookedBy = null;
      slot.bookingTime = null;
      await slot.save();
    }

    if (stuckSlots.length > 0) {
      console.log(`Auto-released ${stuckSlots.length} pending slots due to timeout.`);
    }
  } catch (error) {
    console.error("Error in auto-release job:", error);
  }
}, 60 * 1000);
