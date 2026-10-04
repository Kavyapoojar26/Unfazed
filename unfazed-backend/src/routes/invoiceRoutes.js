const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus
} = require("../controllers/invoiceController");

const router = express.Router();


// Create an invoice
router.post(
  "/",
  authMiddleware,
  createInvoice
);


// Get all invoices
router.get(
  "/",
  authMiddleware,
  getInvoices
);


// Get a single invoice
router.get(
  "/:id",
  authMiddleware,
  getInvoiceById
);


// Update invoice status
router.put(
  "/:id/status",
  authMiddleware,
  updateInvoiceStatus
);


module.exports = router;