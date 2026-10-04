const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "created"
    },

    paymentMethod: {
      type: String,
      default: "razorpay"
    },

    razorpayOrderId: {
      type: String,
      default: ""
    },

    razorpayPaymentId: {
      type: String,
      default: ""
    },

    razorpaySignature: {
      type: String,
      default: ""
    },

    paidAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);