const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
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

    sender: {
      type: String,
      enum: ["therapist", "client"],
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);