import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], 
      required: true
    }
  }
});

locationSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('ParkingLocation', locationSchema);
