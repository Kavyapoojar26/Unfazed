const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createBooking,
  createPublicBooking,
  getBookings
} = require("../controllers/bookingController");

const router = express.Router();

// PUBLIC CLIENT BOOKING
router.post(
  "/public/:slug",
  createPublicBooking
);

// CREATE BOOKING - THERAPIST
router.post(
  "/",
  authMiddleware,
  createBooking
);

// GET ALL BOOKINGS - THERAPIST
router.get(
  "/",
  authMiddleware,
  getBookings
);

module.exports = router;