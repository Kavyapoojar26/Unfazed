const express = require("express");
const { body } = require("express-validator");

const {
  registerTherapist,
  loginTherapist
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
  ],
  registerTherapist
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
  ],
  loginTherapist
);

module.exports = router;