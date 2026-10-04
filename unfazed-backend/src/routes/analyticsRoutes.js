const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  requireFeature
} = require("../middleware/entitlementMiddleware");

const {
  getAnalyticsOverview,
  getAdvancedAnalytics
} = require("../controllers/analyticsController");

const router = express.Router();

// Basic analytics
router.get(
  "/overview",
  authMiddleware,
  getAnalyticsOverview
);

// Advanced analytics — Professional and Business plans only
router.get(
  "/advanced",
  authMiddleware,
  requireFeature("advancedAnalytics"),
  getAdvancedAnalytics
);

module.exports = router;