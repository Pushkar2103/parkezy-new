import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  coordinates: {
    // GeoJSON format: first longitude, then latitude
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
});

// Add the 2dsphere index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });

export default mongoose.model('ParkingLocation', locationSchema);
