import mongoose from 'mongoose'

const slotSchema = new mongoose.Schema({
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingArea', required: true },
  slotNumber: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  bookingTime: Date
}, { timestamps: true })

export default mongoose.model('ParkingSlot', slotSchema)
