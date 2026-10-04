const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage
} = require("../controllers/packageController");

const router = express.Router();


// Create a package
router.post(
  "/",
  authMiddleware,
  createPackage
);


// Get all packages
router.get(
  "/",
  authMiddleware,
  getPackages
);


// Get a single package
router.get(
  "/:id",
  authMiddleware,
  getPackageById
);


// Update a package
router.put(
  "/:id",
  authMiddleware,
  updatePackage
);


module.exports = router;