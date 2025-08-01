import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  // Add a reference to the user who made the booking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parkingSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSlot',
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  // Replace isActive with a more descriptive status
  status: {
    type: String,
    enum: ['booked', 'cancellation_requested', 'cancelled', 'completed'],
    default: 'booked',
  },
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
