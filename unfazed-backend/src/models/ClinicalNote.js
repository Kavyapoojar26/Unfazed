const mongoose = require("mongoose");

const clinicalNoteSchema = new mongoose.Schema(
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

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null
    },

    noteType: {
      type: String,
      enum: ["general", "session", "soap", "dap"],
      default: "session"
    },

    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    visibility: {
      type: String,
      enum: ["private", "shared"],
      default: "private"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ClinicalNote", clinicalNoteSchema);