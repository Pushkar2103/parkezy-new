import ParkingArea from '../models/ParkingArea.js';
import ParkingSlot from '../models/ParkingSlot.js';
import Booking from '../models/Booking.js';
import mongoose from 'mongoose';

export const getAllParkingAreas = async (req, res) => {
  const { search } = req.query;

  try {
    let pipeline = [
      {
        $lookup: {
          from: 'parkinglocations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location'
        }
      },
      {
        $unwind: '$location'
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { 'location.name': { $regex: search, $options: 'i' } },
            { 'location.city': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: 'parkingslots',
          localField: '_id',
          foreignField: 'areaId',
          as: 'slots'
        }
      },
      {
        $addFields: {
          availableSlots: {
            $size: {
              $filter: {
                input: '$slots',
                as: 'slot',
                cond: { $eq: ['$$slot.isAvailable', true] }
              }
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          image: 1,
          totalSlots: 1,
          availableSlots: 1,
          location: {
            name: '$location.name',
            city: '$location.city',
            coordinates: '$location.coordinates'
          }
        }
      }
    );

    const parkingAreas = await ParkingArea.aggregate(pipeline);

    res.status(200).json(parkingAreas);
  } catch (error) {
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

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const slot = await ParkingSlot.findById(slotId).session(session);

    if (!slot) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Parking slot not found' });
    }

    if (!slot.isAvailable) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'This slot is already booked' });
    }

    slot.isAvailable = false;
    slot.bookedBy = userId;
    slot.bookingTime = new Date();
    await slot.save({ session });

    const newBooking = new Booking({
      userName,
      carNumber,
      userId,
      parkingSlot: slotId,
      startTime,
      endTime,
      status: 'booked'
    });
    await newBooking.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Slot booked successfully!', booking: newBooking });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Server error while booking slot', error: error.message });
  } finally {
    session.endSession();
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'parkingSlot',
        populate: {
          path: 'areaId',
          populate: {
            path: 'locationId'
          }
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching user bookings', error: error.message });
  }
};
