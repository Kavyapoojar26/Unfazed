const Therapist = require("../models/Therapist");

// GET THERAPIST PROFILE
const getProfile = async (req, res) => {
  try {
    const therapist = await Therapist.findById(req.therapistId).select(
      "-password_hash"
    );

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found"
      });
    }

    res.json({
      success: true,
      therapist
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// UPDATE THERAPIST PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, bio, specializations, languages, slug } = req.body;

    const therapist = await Therapist.findById(req.therapistId);

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found"
      });
    }

    if (name !== undefined) {
      therapist.name = name.trim();
    }

    if (bio !== undefined) {
      therapist.bio = bio.trim();
    }

    if (specializations !== undefined) {
      therapist.specializations = specializations;
    }

    if (languages !== undefined) {
      therapist.languages = languages;
    }

    if (slug !== undefined) {
      const cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const existingTherapist = await Therapist.findOne({
        slug: cleanSlug,
        _id: { $ne: therapist._id }
      });

      if (existingTherapist) {
        return res.status(409).json({
          success: false,
          message: "Slug is already taken"
        });
      }

      therapist.slug = cleanSlug;
    }

    await therapist.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug,
        bio: therapist.bio,
        specializations: therapist.specializations,
        languages: therapist.languages
      }
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET PUBLIC THERAPIST PROFILE
const getPublicProfile = async (req, res) => {
  try {
    const { slug } = req.params;

    const therapist = await Therapist.findOne({ slug }).select(
      "-password_hash -email"
    );

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: "Therapist not found"
      });
    }

    res.json({
      success: true,
      therapist: {
        name: therapist.name,
        slug: therapist.slug,
        bio: therapist.bio,
        specializations: therapist.specializations,
        languages: therapist.languages
      }
    });
  } catch (error) {
    console.error("Get public profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getPublicProfile
};