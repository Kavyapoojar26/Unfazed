const {
  getTherapistPlan
} = require("../services/entitlementService");

const getMyEntitlements = async (req, res) => {
  try {
    const plan = await getTherapistPlan(req.therapistId);

    res.json({
      success: true,
      plan: {
        key: plan.key,
        name: plan.name
      },
      limits: plan.limits,
      features: plan.features
    });
  } catch (error) {
    console.error(
  "Get entitlements error:",
  error.name,
  error.message,
  error.stack
);

    res.status(500).json({
      success: false,
      message: "Unable to get account entitlements"
    });
  }
};

module.exports = {
  getMyEntitlements
};