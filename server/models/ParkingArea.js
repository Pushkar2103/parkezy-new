import mongoose from 'mongoose'

const parkingAreaSchema = new mongoose.Schema({
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLocation', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  image: String,
  pricePerHour: { type: Number, default: 0 }
})

export default mongoose.model('ParkingArea', parkingAreaSchema)
