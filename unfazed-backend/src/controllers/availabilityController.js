const Availability = require("../models/Availability");
const Therapist = require("../models/Therapist");

// GET AVAILABILITY
const getAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOne({
      therapist: req.therapistId
    });

    if (!availability) {
      return res.json({
        success: true,
        availability: null
      });
    }

    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error("Get availability error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// CREATE OR UPDATE AVAILABILITY
const updateAvailability = async (req, res) => {
  try {
    const {
      weeklySchedule,
      sessionDurations,
      bufferMinutes
    } = req.body;

    let availability = await Availability.findOne({
      therapist: req.therapistId
    });

    if (!availability) {
      availability = await Availability.create({
        therapist: req.therapistId,
        weeklySchedule,
        sessionDurations,
        bufferMinutes
      });
    } else {
      availability.weeklySchedule = weeklySchedule;
      availability.sessionDurations = sessionDurations;
      availability.bufferMinutes = bufferMinutes;

      await availability.save();
    }

    res.json({
      success: true,
      message: "Availability updated successfully",
      availability
    });
  } catch (error) {
    console.error("Update availability error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getPublicAvailability = async (req, res) => {
  try {
    const { slug } = req.params;

    const therapist = await Therapist.findOne({
      slug
    }).select("_id");

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found"
      });
    }

    const availability = await Availability.findOne({
      therapist: therapist._id
    }).select("weeklySchedule sessionDurations bufferMinutes");

    if (!availability) {
      return res.json({
        success: true,
        availability: null
      });
    }

    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error("Get public availability error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load availability"
    });
  }
};

module.exports = {
  getAvailability,
  updateAvailability,
  getPublicAvailability
};