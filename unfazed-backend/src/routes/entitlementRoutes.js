const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyEntitlements
} = require("../controllers/entitlementController");

const router = express.Router();

// Get current therapist's plan and entitlements
router.get(
  "/me",
  authMiddleware,
  getMyEntitlements
);

module.exports = router;