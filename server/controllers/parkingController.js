import ParkingArea from '../models/ParkingArea.js';
import ParkingLocation from '../models/ParkingLocation.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

export const createParkingArea = async (req, res) => {
  const {
    name,
    totalSlots,
    image,
    locationName,
    city,
    lat,
    lng
  } = req.body;
  const ownerId = req.user._id;

  if (!name || !totalSlots || !locationName || !city) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  // NOTE: Transactions removed to support standalone MongoDB instances.
  try {
    let location = await ParkingLocation.findOne({ name: locationName, city });

    if (!location) {
      location = await ParkingLocation.create({
        name: locationName,
        city,
        coordinates: { lat, lng }
      });
    }

    const newParkingArea = await ParkingArea.create({
      ownerId,
      locationId: location._id,
      name,
      totalSlots,
      image
    });

    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        areaId: newParkingArea._id,
        slotNumber: `S${i}`,
      });
    }
    await ParkingSlot.insertMany(slots);

    res.status(201).json(newParkingArea);

  } catch (error) {
    console.error('Error creating parking area:', error);
    res.status(500).json({ message: 'Server error while creating parking area.', error: error.message });
  }
};

export const getOwnerParkingAreas = async (req, res) => {
  try {
    const parkingAreas = await ParkingArea.find({ ownerId: req.user._id }).populate('locationId');
    res.status(200).json(parkingAreas);
  } catch (error) {
    console.error('Error fetching owner parking areas:', error);
    res.status(500).json({ message: 'Server error while fetching parking areas.' });
  }
};

export const updateParkingArea = async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;

  try {
    const parkingArea = await ParkingArea.findById(id);

    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found.' });
    }

    if (parkingArea.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to update this parking area.' });
    }

    parkingArea.name = name || parkingArea.name;
    parkingArea.image = image || parkingArea.image;

    const updatedParkingArea = await parkingArea.save();
    res.status(200).json(updatedParkingArea);

  } catch (error) {
    console.error('Error updating parking area:', error);
    res.status(500).json({ message: 'Server error while updating parking area.' });
  }
};

export const deleteParkingArea = async (req, res) => {
  const { id } = req.params;

  // NOTE: Transactions removed to support standalone MongoDB instances.
  try {
    const parkingArea = await ParkingArea.findById(id);

    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found.' });
    }

    if (parkingArea.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this parking area.' });
    }

    const slotsToDelete = await ParkingSlot.find({ areaId: id });
    const slotIds = slotsToDelete.map(slot => slot._id);

    await Booking.deleteMany({ parkingSlot: { $in: slotIds } });
    await ParkingSlot.deleteMany({ areaId: id });
    await ParkingArea.findByIdAndDelete(id);

    res.status(200).json({ message: 'Parking area and all associated data deleted successfully.' });

  } catch (error) {
    console.error('Error deleting parking area:', error);
    res.status(500).json({ message: 'Server error while deleting parking area.' });
  }
};

export const getOwnerDashboardStats = async (req, res) => {
  const ownerId = req.user._id;

  try {
    const ownerParkingAreas = await ParkingArea.find({ ownerId }).select('_id name');
    
    if (ownerParkingAreas.length === 0) {
      return res.status(200).json({
        totalAreas: 0,
        totalSlots: 0,
        occupiedSlots: 0,
        currentOccupancy: 0,
        totalBookings: 0,
        cancellationRequests: 0,
        parkingAreas: []
      });
    }

    const areaIds = ownerParkingAreas.map(area => area._id);

    const totalSlots = await ParkingSlot.countDocuments({ areaId: { $in: areaIds } });
    const occupiedSlots = await ParkingSlot.countDocuments({ areaId: { $in: areaIds }, isAvailable: false });
    
    const slotsInOwnerAreas = await ParkingSlot.find({ areaId: { $in: areaIds } }).select('_id');
    const slotIds = slotsInOwnerAreas.map(slot => slot._id);

    const totalBookings = await Booking.countDocuments({ parkingSlot: { $in: slotIds } });
    const cancellationRequests = await Booking.countDocuments({ parkingSlot: { $in: slotIds }, status: 'cancellation_requested' });

    res.status(200).json({
      totalAreas: ownerParkingAreas.length,
      parkingAreas: ownerParkingAreas,
      totalSlots,
      occupiedSlots,
      currentOccupancy: totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0,
      totalBookings,
      cancellationRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching dashboard stats', error: error.message });
  }
};
