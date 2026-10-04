const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  getProfile,
  updateProfile,
  getPublicProfile
} = require("../controllers/therapistController");

const router = express.Router();

// GET PROFILE
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// UPDATE PROFILE
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

// GET PUBLIC PROFILE
router.get(
  "/public/:slug",
  getPublicProfile
);

module.exports = router;