const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus
} = require("../controllers/paymentController");

const router = express.Router();

// Create a payment
router.post(
  "/",
  authMiddleware,
  createPayment
);

// Create Razorpay order
router.post(
  "/razorpay/order",
  authMiddleware,
  createRazorpayOrder
);

// Verify Razorpay payment
router.post(
  "/razorpay/verify",
  authMiddleware,
  verifyRazorpayPayment
);

// Get all payments
router.get(
  "/",
  authMiddleware,
  getPayments
);

// Get a single payment
router.get(
  "/:id",
  authMiddleware,
  getPaymentById
);

// Update payment status
router.put(
  "/:id/status",
  authMiddleware,
  updatePaymentStatus
);

module.exports = router;