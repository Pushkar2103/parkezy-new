import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; 
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

export const getAllParkingAreas = async (req, res) => {
  const { search } = req.query;
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng) : null;
  const radius = req.query.radius ? parseFloat(req.query.radius) : 10;

  try {
    const allParkingAreas = await ParkingArea.find({}).populate('locationId');

    if (allParkingAreas.length === 0) {
        return res.status(200).json([]);
    }

    const augmentedAreas = await Promise.all(allParkingAreas.map(async (area) => {
      const availableSlots = await ParkingSlot.countDocuments({ areaId: area._id, isAvailable: true });
      return {
        _id: area._id,
        name: area.name,
        image: area.image,
        totalSlots: area.totalSlots,
        availableSlots: availableSlots,
        location: area.locationId,
      };
    }));

    let nearbyAreas = augmentedAreas;
    if (lat && lng) {
      nearbyAreas = augmentedAreas
        .map(area => {
          const coords = area.location?.coordinates?.coordinates;
          if (!coords || !Array.isArray(coords) || coords.length !== 2) {
            return null;
          }
          
          const parkingLng = coords[0];
          const parkingLat = coords[1];
          const distance = getDistance(lat, lng, parkingLat, parkingLng);
          
          return { ...area, distance };
        })
        .filter(area => area && area.distance <= radius)
        .sort((a, b) => a.distance - b.distance);
    }

    let finalResults = nearbyAreas;
    if (search) {
      const searchQuery = search.toLowerCase();
      finalResults = nearbyAreas.filter(area =>
        area.name.toLowerCase().includes(searchQuery) ||
        (area.location && area.location.name.toLowerCase().includes(searchQuery)) ||
        (area.location && area.location.city.toLowerCase().includes(searchQuery))
      );
    }

    const resultsForFrontend = finalResults.map(area => {
        const { location, ...rest } = area;
        const coords = location?.coordinates?.coordinates;

        if (!location || !coords) {
            return null;
        }

        return {
            ...rest,
            location: {
                _id: location._id,
                name: location.name,
                city: location.city,
                coordinates: {
                    lat: coords[1], // latitude
                    lng: coords[0]  // longitude
                }
            }
        };
    }).filter(Boolean); // Remove any null entries from the final array

    res.status(200).json(resultsForFrontend);
  } catch (error) {
    console.error("Error in getAllParkingAreas:", error);
    res.status(500).json({ message: 'Server error while fetching parking areas', error: error.message });
  }
};


export const getParkingAreaDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const parkingArea = await ParkingArea.findById(id).populate('locationId');

    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found' });
    }

    const slots = await ParkingSlot.find({ areaId: id });

    res.status(200).json({ area: parkingArea, slots });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching parking area details', error: error.message });
  }
};

export const bookSlot = async (req, res) => {
  const { slotId, carNumber, startTime, endTime } = req.body;
  const userId = req.user._id;
  const userName = req.user.name;

  if (!slotId || !carNumber || !startTime || !endTime) {
    return res.status(400).json({ message: 'Please provide all required booking details.' });
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
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (!slot.isAvailable) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    slot.isAvailable = false;
    slot.bookedBy = userId;
    slot.bookingTime = new Date();
    await slot.save();

    const newBooking = new Booking({
      userName,
      carNumber,
      userId,
      parkingSlot: slotId,
      startTime,
      endTime,
      status: 'booked'
    });
    await newBooking.save();

    res.status(201).json({ message: 'Slot booked successfully!', booking: newBooking });

  } catch (error) {
    console.error("Error in bookSlot:", error);
    res.status(500).json({ message: 'Server error while booking slot', error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({ 
            userId,
            status: { $nin: ['completed', 'cancelled'] } 
        })
        .populate({
            path: 'parkingSlot',
            populate: { path: 'areaId', populate: { path: 'locationId' } }
        })
        .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching user bookings', error: error.message });
    }
};

export const getUserBookingHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const bookings = await Booking.find({ 
            userId,
            status: { $in: ['completed', 'cancelled'] } 
        })
        .populate({
            path: 'parkingSlot',
            populate: { path: 'areaId', populate: { path: 'locationId' } }
        })
        .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching booking history', error: error.message });
    }
};

export const getSlotAvailability = async (req, res) => {
    try {
        const { slotId } = req.params;
        const slot = await ParkingSlot.findById(slotId);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found.' });
        }

        res.status(200).json({ 
            isAvailable: slot.isAvailable,
            areaId: slot.areaId 
        });
    } catch (error) {
        console.error("Error in getSlotAvailability:", error);
        res.status(500).json({ message: 'Server error while checking slot availability.' });
    }
};