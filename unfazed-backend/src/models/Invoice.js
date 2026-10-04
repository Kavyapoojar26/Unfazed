const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
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

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
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
      enum: ["draft", "issued", "paid", "cancelled"],
      default: "issued"
    },

    issuedAt: {
      type: Date,
      default: Date.now
    },

    dueDate: {
      type: Date,
      default: null
    },

    description: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);