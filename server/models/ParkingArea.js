import mongoose from 'mongoose'

const parkingAreaSchema = new mongoose.Schema({
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingLocation', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  totalSlots: { type: Number, required: true },
  isVIPMap: { type: Boolean, default: false }, // if true, custom image/map view
  image: String // map image URL or preview
}, { timestamps: true })

export default mongoose.model('ParkingArea', parkingAreaSchema)
