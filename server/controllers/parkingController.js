import ParkingArea from '../models/ParkingArea.js';
import ParkingLocation from '../models/ParkingLocation.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';

export const createParkingArea = async (req, res) => {
  const {
    name,
    totalSlots,
    locationName,
    city,
    pricePerHour,
    lat,
    lng,
    parkingType,
    evCharging,
    securityFeatures,
    vehicleTypes
  } = req.body;
  const ownerId = req.user._id;

  const image = req.file ? req.file.path : '';

  if (!name || !totalSlots || !locationName || !city || !lat || !lng) {
    return res.status(400).json({ message: 'Please provide all required fields, including coordinates from the map.' });
  }

  // Validate parkingType
  if (parkingType && !['covered', 'open-air', 'mixed'].includes(parkingType)) {
    return res.status(400).json({ message: 'Invalid parking type. Must be: covered, open-air, or mixed.' });
  }

  // Validate vehicleTypes
  if (vehicleTypes && Array.isArray(vehicleTypes)) {
    const validTypes = ['bike', 'car', 'compact-suv', 'full-suv', 'truck'];
    const invalid = vehicleTypes.filter(type => !validTypes.includes(type));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid vehicle types: ${invalid.join(', ')}` });
    }
  }

  try {
    let location = await ParkingLocation.findOne({ name: locationName, city });

    if (!location) {
      location = await ParkingLocation.create({
        name: locationName,
        city,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(lng), parseFloat(lat)]
        }
      });
    }

    const parkingAreaData = {
      ownerId,
      locationId: location._id,
      name,
      totalSlots,
      pricePerHour: parseFloat(pricePerHour) || 0,
      image
    };

    // Add new fields if provided
    if (parkingType) parkingAreaData.parkingType = parkingType;
    if (typeof evCharging === 'boolean') parkingAreaData.evCharging = evCharging;
    if (securityFeatures && typeof securityFeatures === 'object') {
      parkingAreaData.securityFeatures = securityFeatures;
    }
    if (vehicleTypes && Array.isArray(vehicleTypes)) {
      parkingAreaData.vehicleTypes = vehicleTypes;
    }

    const newParkingArea = await ParkingArea.create(parkingAreaData);

    const slots = [];
    for (let i = 1; i <= totalSlots; i++) {
      slots.push({
        areaId: newParkingArea._id,
        slotNumber: `S${i}`,
        status: 'available', // added
        isAvailable: true    // added
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
  const { name, parkingType, evCharging, securityFeatures, vehicleTypes } = req.body;
  const image = req.file ? req.file.path : '';
  const pricePerHour = req.body.pricePerHour ? parseFloat(req.body.pricePerHour) : 0;

  // Validate parkingType if provided
  if (parkingType && !['covered', 'open-air', 'mixed'].includes(parkingType)) {
    return res.status(400).json({ message: 'Invalid parking type. Must be: covered, open-air, or mixed.' });
  }

  // Validate vehicleTypes if provided
  if (vehicleTypes && Array.isArray(vehicleTypes)) {
    const validTypes = ['bike', 'car', 'compact-suv', 'full-suv', 'truck'];
    const invalid = vehicleTypes.filter(type => !validTypes.includes(type));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid vehicle types: ${invalid.join(', ')}` });
    }
  }

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
    parkingArea.pricePerHour = pricePerHour;

    // Update new fields if provided
    if (parkingType) parkingArea.parkingType = parkingType;
    if (typeof evCharging === 'boolean') parkingArea.evCharging = evCharging;
    if (securityFeatures && typeof securityFeatures === 'object') {
      parkingArea.securityFeatures = securityFeatures;
    }
    if (vehicleTypes && Array.isArray(vehicleTypes)) {
      parkingArea.vehicleTypes = vehicleTypes;
    }

    const updatedParkingArea = await parkingArea.save();
    res.status(200).json(updatedParkingArea);

  } catch (error) {
    console.error('Error updating parking area:', error);
    res.status(500).json({ message: 'Server error while updating parking area.' });
  }
};

export const deleteParkingArea = async (req, res) => {
  const { id } = req.params;

  try {
    const parkingArea = await ParkingArea.findById(id);

    if (!parkingArea) {
      return res.status(404).json({ message: 'Parking area not found.' });
    }

    if (parkingArea.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'User not authorized to delete this parking area.' });
    }

    const locationId = parkingArea.locationId;

    const slotsToDelete = await ParkingSlot.find({ areaId: id });
    const slotIds = slotsToDelete.map(slot => slot._id);

    await Booking.deleteMany({ parkingSlot: { $in: slotIds } });
    await ParkingSlot.deleteMany({ areaId: id });
    await ParkingArea.findByIdAndDelete(id);

    const otherAreasCount = await ParkingArea.countDocuments({ locationId });
    if (otherAreasCount === 0) {
      await ParkingLocation.findByIdAndDelete(locationId);
    }

    res.status(200).json({ message: 'Parking area and all associated data deleted successfully.' });

  } catch (error) {
    console.error('Error deleting parking area:', error);
    res.status(500).json({ message: 'Server error while deleting parking area.' });
  }
};

export const getOwnerDashboardStats = async (req, res) => {
  const ownerId = req.user._id;

  try {
    const ownerParkingAreas = await ParkingArea.find({ ownerId }).select('_id name pricePerHour');
    
    if (ownerParkingAreas.length === 0) {
      return res.status(200).json({
        totalAreas: 0,
        totalSlots: 0,
        occupiedSlots: 0,
        currentOccupancy: 0,
        totalBookings: 0,
        cancellationRequests: 0,
        earnings: 0,
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

    let totalEarnings = await Booking.aggregate([
      { $match: { parkingSlot: { $in: slotIds }, paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    totalEarnings = totalEarnings.length ? totalEarnings[0].total : 0;

    res.status(200).json({
      totalAreas: ownerParkingAreas.length,
      parkingAreas: ownerParkingAreas,
      totalSlots,
      occupiedSlots,
      currentOccupancy: totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0,
      earnings: totalEarnings,
      totalBookings,
      cancellationRequests,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching dashboard stats', error: error.message });
  }
};
