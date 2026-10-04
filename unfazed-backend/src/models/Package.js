const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    sessionCount: {
      type: Number,
      required: true,
      enum: [3, 6, 12]
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    validityDays: {
      type: Number,
      default: 90,
      min: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Package", packageSchema);