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
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);