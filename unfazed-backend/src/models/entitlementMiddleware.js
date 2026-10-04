const {
  canAccess
} = require("../services/entitlementService");

const requireFeature = (feature) => {
  return async (req, res, next) => {
    try {
      const allowed = await canAccess(
        req.therapistId,
        feature
      );

      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Your current plan does not include the ${feature} feature`
        });
      }

      next();
    } catch (error) {
      console.error("Entitlement check error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to verify feature access"
      });
    }
  };
};

module.exports = {
  requireFeature
};