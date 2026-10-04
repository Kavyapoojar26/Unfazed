const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      unique: true
    },

    weeklySchedule: [
      {
        dayOfWeek: {
          type: Number,
          required: true,
          min: 0,
          max: 6
        },

        enabled: {
          type: Boolean,
          default: true
        },

        startTime: {
          type: String,
          required: true
        },

        endTime: {
          type: String,
          required: true
        }
      }
    ],

    sessionDurations: {
      type: [Number],
      default: [30, 45, 60, 90]
    },

    bufferMinutes: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Availability", availabilitySchema);