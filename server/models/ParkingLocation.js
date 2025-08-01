import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Sector 21 Noida'
  city: { type: String, required: true }, // e.g., 'Noida'
  coordinates: {
    lat: Number,
    lng: Number
  }
})

export default mongoose.model('ParkingLocation', locationSchema)
