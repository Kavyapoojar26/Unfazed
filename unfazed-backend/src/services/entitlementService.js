const Therapist = require("../models/Therapist");
const PLANS = require("../config/entitlements");

const getTherapistPlan = async (therapistId) => {
  const therapist = await Therapist.findById(therapistId).select(
    "subscriptionPlan"
  );

  if (!therapist) {
    throw new Error("Therapist not found");
  }

  const planKey = therapist.subscriptionPlan || "starter";
  const plan = PLANS[planKey];

  if (!plan) {
    throw new Error("Invalid subscription plan");
  }

  return {
    key: planKey,
    ...plan
  };
};

const canAccess = async (therapistId, feature) => {
  const plan = await getTherapistPlan(therapistId);

  return plan.features[feature] === true;
};

const getLimit = async (therapistId, limitKey) => {
  const plan = await getTherapistPlan(therapistId);

  return plan.limits[limitKey];
};

const checkLimit = async (therapistId, limitKey, currentUsage) => {
  const limit = await getLimit(therapistId, limitKey);

  // -1 means unlimited.
  if (limit === -1) {
    return true;
  }

  return currentUsage < limit;
};

module.exports = {
  getTherapistPlan,
  canAccess,
  getLimit,
  checkLimit
};