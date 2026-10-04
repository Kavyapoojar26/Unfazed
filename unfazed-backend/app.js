require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentController = require("./src/controllers/paymentController");

const authRoutes = require("./src/routes/authRoutes");
const therapistRoutes = require("./src/routes/therapistRoutes");
const availabilityRoutes = require("./src/routes/availabilityRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const clientRoutes = require("./src/routes/clientRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const packageRoutes = require("./src/routes/packageRoutes");
const invoiceRoutes = require("./src/routes/invoiceRoutes");
const clinicalNoteRoutes = require("./src/routes/clinicalNoteRoutes");
const entitlementRoutes = require("./src/routes/entitlementRoutes");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const notificationRoutes = require("./src/routes/notificationRoutes");
const chatRoutes = require("./src/routes/chatRoutes");

const app = express();

app.use(cors());

// Razorpay webhook must receive the raw request body
// before express.json() parses it.
app.post(
  "/api/payments/razorpay/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleRazorpayWebhook
);

// Parse JSON for all other API requests.
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Unfazed API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/therapist", therapistRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/clinical-notes", clinicalNoteRoutes);
app.use("/api/entitlements", entitlementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;