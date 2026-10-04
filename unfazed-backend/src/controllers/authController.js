const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Therapist = require("../models/Therapist");

// REGISTER THERAPIST
const registerTherapist = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    const existingTherapist = await Therapist.findOne({ email });

    if (existingTherapist) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    while (await Therapist.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const therapist = await Therapist.create({
      name,
      email,
      password_hash,
      slug
    });

    return res.status(201).json({
      success: true,
      message: "Therapist registered successfully",
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug
      }
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// LOGIN THERAPIST
const loginTherapist = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const therapist = await Therapist.findOne({ email });

    if (!therapist) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      therapist.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        therapistId: therapist._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        slug: therapist.slug
      }
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  registerTherapist,
  loginTherapist
};