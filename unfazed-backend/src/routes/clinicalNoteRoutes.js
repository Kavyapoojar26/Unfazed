const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createClinicalNote,
  getClinicalNotes,
  getClinicalNoteById,
  updateClinicalNote,
  deleteClinicalNote
} = require("../controllers/clinicalNoteController");

const router = express.Router();

// Create a clinical note
router.post(
  "/",
  authMiddleware,
  createClinicalNote
);

// Get all clinical notes
router.get(
  "/",
  authMiddleware,
  getClinicalNotes
);

// Get a single clinical note
router.get(
  "/:id",
  authMiddleware,
  getClinicalNoteById
);

// Update a clinical note
router.put(
  "/:id",
  authMiddleware,
  updateClinicalNote
);

// Delete a clinical note
router.delete(
  "/:id",
  authMiddleware,
  deleteClinicalNote
);

module.exports = router;