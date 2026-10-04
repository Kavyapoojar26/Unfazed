const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true
    },

    clientName: {
      type: String,
      required: true,
      trim: true
    },

    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    startTime: {
      type: Date,
      required: true
    },

    endTime: {
      type: Date,
      required: true
    },

    durationMinutes: {
      type: Number,
      required: true,
      enum: [30, 45, 60, 90]
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "no_show"
      ],
      default: "pending"
    },

    clientTimezone: {
      type: String,
      default: "UTC"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);