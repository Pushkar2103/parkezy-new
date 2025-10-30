import mongoose from 'mongoose'

const parkingAreaSchema = new mongoose.Schema({
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLocation', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  image: String,
  pricePerHour: { type: Number, default: 0 },
  // New filter fields
  parkingType: {
    type: String,
    enum: ['covered', 'open-air', 'mixed'],
    default: 'open-air'
  },
  evCharging: {
    type: Boolean,
    default: false
  },
  securityFeatures: {
    cctv: { type: Boolean, default: false },
    securityGuard: { type: Boolean, default: false },
    gatedAccess: { type: Boolean, default: false },
    lighting: { type: Boolean, default: false }
  },
  vehicleTypes: [{
    type: String,
    enum: ['bike', 'car', 'compact-suv', 'full-suv', 'truck']
  }]
})

export default mongoose.model('ParkingArea', parkingAreaSchema)
