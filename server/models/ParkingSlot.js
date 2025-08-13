import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  areaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ParkingArea",
    required: true,
  },
  slotNumber: { type: String, required: true },
  status: {
    type: String,
    enum: ["available", "pending", "booked"],
    default: "available",
  },
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  bookingTime: { type: Date, default: null },
});

export default mongoose.model("ParkingSlot", slotSchema);
