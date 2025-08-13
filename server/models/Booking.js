import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  carNumber: {
    type: String,
    required: true,
  },
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
  status: {
    type: String,
    enum: ['booked', 'cancellation_requested', 'cancelled', 'completed', 'completion_requested'],
    default: 'booked',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  orderId: {
    type: String,
    required: function () {
      return this.amountPaid > 0;
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', null],
    default: null
  },
  paymentMethod: {
    type: String
  },
  paymentSessionId: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
