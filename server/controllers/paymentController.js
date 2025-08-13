import axios from "axios";
import Booking from "../models/Booking.js";
import ParkingSlot from "../models/ParkingSlot.js";
import crypto from "crypto";

const CASHFREE_BASE_URL = process.env.CASHFREE_BASE_URL;
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION;
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;

export const initiatePayment = async (req, res) => {
  const { slotId } = req.body;
  let bookingId = null;

  try {
    const { carNumber, startTime, endTime, amountPaid } = req.body;
    const userId = req.user._id;

    if (!slotId || !carNumber || !startTime || !endTime || amountPaid === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const slot = await ParkingSlot.findOneAndUpdate(
      { _id: slotId, status: "available" },
      { $set: { status: "pending", bookedBy: userId, bookingTime: new Date() } },
      { new: true }
    );

    if (!slot) {
      return res.status(400).json({ message: "Slot is not available" });
    }

    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;

    const booking = new Booking({
      carNumber,
      userId,
      parkingSlot: slotId,
      startTime,
      endTime,
      amountPaid: amountPaid || 0,
      orderId: amountPaid > 0 ? orderId : undefined,
      paymentStatus: amountPaid > 0 ? "pending" : null,
    });
    await booking.save();
    bookingId = booking._id;

    if (amountPaid === 0) {
      booking.status = "booked";
      slot.status = "booked";
      await booking.save();
      await slot.save();
      return res.status(201).json({ message: "Booking confirmed without payment", booking });
    }

    const payload = {
      order_id: orderId,
      order_amount: Number(amountPaid),
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_name: req.user.name,
        customer_email: req.user.email,
        customer_phone: req.user.phone || "9000000000",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment-success?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
      },
      order_note: "Parking Slot Booking",
    };

    const response = await axios.post(`${CASHFREE_BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": CASHFREE_API_VERSION,
        "Content-Type": "application/json",
      },
    });

    booking.paymentSessionId = response.data.payment_session_id;
    await booking.save();

    res.status(200).json({
      message: "Payment initiated",
      paymentSessionId: response.data.payment_session_id,
      orderId,
    });
  } catch (error) {
    if (bookingId) {
      await Booking.deleteOne({ _id: bookingId });
    }
    if (slotId) {
      await ParkingSlot.updateOne(
        { _id: slotId, status: "pending" },
        { $set: { status: "available", bookedBy: null, bookingTime: null } }
      );
    }
    res.status(500).json({
      message: "Payment initiation failed",
      error: error.response?.data || error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: "Missing orderId" });

    const booking = await Booking.findOne({ orderId });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const response = await axios.get(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": CASHFREE_API_VERSION,
      },
    });

    const paymentStatus = response.data.order_status;

    if (paymentStatus === "PAID") {
      
      booking.paymentStatus = "paid";
      booking.status = "booked";
      await booking.save();

      const slot = await ParkingSlot.findById(booking.parkingSlot);
      if (slot) {
        slot.status = "booked";
        await slot.save();
      }

      return res.status(200).json({ message: "Payment verified and booking confirmed", paymentStatus });
    } else {
      await Booking.deleteOne({ _id: booking._id });

      const slot = await ParkingSlot.findById(booking.parkingSlot);
      if (slot && slot.status === "pending") {
        slot.status = "available";
        slot.bookedBy = null;
        slot.bookingTime = null;
        await slot.save();
      }

      return res.status(400).json({ message: "Payment not successful, booking cancelled", paymentStatus });
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({ message: "Payment verification failed", error: error.message });
  }
};

export const cashfreeWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-webhook-signature"];
    const payload = JSON.stringify(req.body);

    const expectedSignature = crypto
      .createHmac("sha256", CASHFREE_SECRET_KEY)
      .update(payload)
      .digest("base64");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const { order_id, order_status } = req.body.data;

    const booking = await Booking.findOne({ orderId: order_id });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = order_status === "PAID" ? "paid" : "failed";
    booking.status = order_status === "PAID" ? "booked" : "cancelled";
    await booking.save();

    if (order_status !== "PAID") {
      const slot = await ParkingSlot.findById(booking.parkingSlot);
      if (slot) {
        slot.status = "available";
        slot.bookedBy = null;
        slot.bookingTime = null;
        await slot.save();
      }
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error in cashfreeWebhook:", error);
    res.status(500).json({ message: "Webhook handling failed", error: error.message });
  }
};