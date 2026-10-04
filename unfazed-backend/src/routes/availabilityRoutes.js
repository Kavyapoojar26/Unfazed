const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAvailability,
  updateAvailability,
  getPublicAvailability
} = require("../controllers/availabilityController");

const router = express.Router();

// Public therapist availability
router.get(
  "/public/:slug",
  getPublicAvailability
);

// Therapist availability
router.get(
  "/",
  authMiddleware,
  getAvailability
);

router.put(
  "/",
  authMiddleware,
  updateAvailability
);

module.exports = router;