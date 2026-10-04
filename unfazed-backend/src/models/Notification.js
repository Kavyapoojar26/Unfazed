const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
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
      default: null
    },

    type: {
      type: String,
      enum: [
        "booking_created",
        "booking_confirmed",
        "booking_cancelled",
        "payment_received",
        "invoice_created",
        "general"
      ],
      default: "general"
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);