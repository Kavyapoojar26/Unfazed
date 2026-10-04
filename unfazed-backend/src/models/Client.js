const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
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

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      default: "",
      trim: true
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active"
    },

    tags: {
      type: [String],
      default: []
    },

    notes: {
      type: String,
      default: ""
    },

    intakeCompleted: {
      type: Boolean,
      default: false
    },

    consentGiven: {
      type: Boolean,
      default: false
    },

    lastSessionAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Client", clientSchema);