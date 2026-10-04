const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createClient,
  getClients,
  getClientById,
  updateClient,
  updateClientIntake
} = require("../controllers/clientController");

const router = express.Router();


// Create a new client
router.post(
  "/",
  authMiddleware,
  createClient
);


// Get all clients
router.get(
  "/",
  authMiddleware,
  getClients
);


// Update intake and consent
router.put(
  "/:id/intake",
  authMiddleware,
  updateClientIntake
);


// Update client
router.put(
  "/:id",
  authMiddleware,
  updateClient
);


// Get single client
router.get(
  "/:id",
  authMiddleware,
  getClientById
);


module.exports = router;