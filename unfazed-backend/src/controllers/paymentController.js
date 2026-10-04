const crypto = require("crypto");

const Payment = require("../models/Payment");
const Client = require("../models/Client");
const razorpay = require("../config/razorpay");

/* =========================================================
   RAZORPAY WEBHOOK
========================================================= */

const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"];

    if (!webhookSignature) {
      return res.status(400).json({
        success: false,
        message: "Webhook signature is required"
      });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Webhook secret is not configured"
      });
    }

    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({
        success: false,
        message: "Webhook raw body is required"
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    const generatedSignatureBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedSignatureBuffer = Buffer.from(
      webhookSignature,
      "utf8"
    );

    const isSignatureValid =
      generatedSignatureBuffer.length === receivedSignatureBuffer.length &&
      crypto.timingSafeEqual(
        generatedSignatureBuffer,
        receivedSignatureBuffer
      );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid webhook signature"
      });
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    /* ---------------- PAYMENT CAPTURED ---------------- */

    if (event.event === "payment.captured") {
      const razorpayPayment = event.payload?.payment?.entity;

      if (razorpayPayment?.order_id) {
        await Payment.findOneAndUpdate(
          {
            razorpayOrderId: razorpayPayment.order_id
          },
          {
            status: "paid",
            razorpayPaymentId: razorpayPayment.id || "",
            paidAt: new Date()
          }
        );
      }
    }

    /* ---------------- PAYMENT FAILED ---------------- */

    if (event.event === "payment.failed") {
      const razorpayPayment = event.payload?.payment?.entity;

      if (razorpayPayment?.order_id) {
        await Payment.findOneAndUpdate(
          {
            razorpayOrderId: razorpayPayment.order_id
          },
          {
            status: "failed",
            razorpayPaymentId: razorpayPayment.id || ""
          }
        );
      }
    }

    return res.json({
      success: true,
      message: "Webhook processed successfully"
    });
  } catch (error) {
    console.error("Razorpay webhook error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process Razorpay webhook"
    });
  }
};


/* =========================================================
   CREATE MANUAL PAYMENT
========================================================= */

const createPayment = async (req, res) => {
  try {
    const {
      clientId,
      amount,
      currency,

      // Accept both names
      paymentMethod,
      method,

      status
    } = req.body;

    if (!clientId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Client and amount are required"
      });
    }

    /* ---------------- CLIENT VALIDATION ---------------- */

    const client = await Client.findOne({
      _id: clientId,
      therapist: req.therapistId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    /* ---------------- AMOUNT VALIDATION ---------------- */

    if (!Number.isFinite(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid non-negative number"
      });
    }

    /* ---------------- PAYMENT METHOD ---------------- */

    const selectedMethod = (
      paymentMethod ||
      method ||
      "razorpay"
    )
      .toString()
      .trim()
      .toLowerCase();

    const allowedMethods = [
      "razorpay",
      "upi",
      "card",
      "cash",
      "bank_transfer"
    ];

    if (!allowedMethods.includes(selectedMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    /* ---------------- STATUS ---------------- */

    const allowedStatuses = [
      "created",
      "pending",
      "paid",
      "failed",
      "refunded"
    ];

    const selectedStatus = status || "created";

    if (!allowedStatuses.includes(selectedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    /* ---------------- CREATE PAYMENT ---------------- */

    const payment = await Payment.create({
      therapist: req.therapistId,
      client: clientId,
      amount: Number(amount),
      currency: currency || "INR",
      paymentMethod: selectedMethod,
      status: selectedStatus,
      paidAt: selectedStatus === "paid" ? new Date() : null
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment
    });
  } catch (error) {
    console.error("Create payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

const createRazorpayOrder = async (req, res) => {
  try {
    const {
      clientId,
      amount,
      currency
    } = req.body;

    if (!clientId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Client and amount are required"
      });
    }

    /* ---------------- CLIENT VALIDATION ---------------- */

    const client = await Client.findOne({
      _id: clientId,
      therapist: req.therapistId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    /* ---------------- AMOUNT VALIDATION ---------------- */

    const amountNumber = Number(amount);

    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero"
      });
    }

    const selectedCurrency = currency || "INR";

    /* ---------------- RAZORPAY ORDER ---------------- */

    const options = {
      amount: Math.round(amountNumber * 100),
      currency: selectedCurrency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    /* ---------------- PAYMENT RECORD ---------------- */

    const payment = await Payment.create({
      therapist: req.therapistId,
      client: clientId,
      amount: amountNumber,
      currency: selectedCurrency,
      paymentMethod: "razorpay",
      razorpayOrderId: order.id,
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Razorpay order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency
      },

      payment
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order"
    });
  }
};


/* =========================================================
   VERIFY RAZORPAY PAYMENT
========================================================= */

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment verification details are required"
      });
    }

    /* ---------------- FIND PAYMENT ---------------- */

    const payment = await Payment.findOne({
      therapist: req.therapistId,
      razorpayOrderId: razorpay_order_id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found"
      });
    }

    /* ---------------- SIGNATURE ---------------- */

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    const generatedSignatureBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedSignatureBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const isSignatureValid =
      generatedSignatureBuffer.length ===
        receivedSignatureBuffer.length &&
      crypto.timingSafeEqual(
        generatedSignatureBuffer,
        receivedSignatureBuffer
      );

    if (!isSignatureValid) {
      payment.status = "failed";

      await payment.save();

      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay payment signature"
      });
    }

    /* ---------------- UPDATE PAYMENT ---------------- */

    payment.status = "paid";
    payment.paymentMethod = "razorpay";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = payment.paidAt || new Date();

    await payment.save();

    return res.json({
      success: true,
      message: "Razorpay payment verified successfully",
      payment
    });
  } catch (error) {
    console.error(
      "Verify Razorpay payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify Razorpay payment"
    });
  }
};


/* =========================================================
   GET ALL PAYMENTS
========================================================= */

const getPayments = async (req, res) => {
  try {
    const {
      status,
      clientId
    } = req.query;

    const query = {
      therapist: req.therapistId
    };

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.client = clientId;
    }

    const payments = await Payment.find(query)
      .populate("client", "name email")
      .sort({
        createdAt: -1
      });

    return res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error("Get payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* =========================================================
   GET PAYMENT BY ID
========================================================= */

const getPaymentById = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    const payment = await Payment.findOne({
      _id: id,
      therapist: req.therapistId
    }).populate(
      "client",
      "name email"
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    return res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error(
      "Get payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* =========================================================
   UPDATE PAYMENT STATUS
========================================================= */

const updatePaymentStatus = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    const {
      status
    } = req.body;

    const allowedStatuses = [
      "created",
      "pending",
      "paid",
      "failed",
      "refunded"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status"
      });
    }

    const payment = await Payment.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    payment.status = status;

    if (
      status === "paid" &&
      !payment.paidAt
    ) {
      payment.paidAt = new Date();
    }

    await payment.save();

    return res.json({
      success: true,
      message: "Payment status updated successfully",
      payment
    });
  } catch (error) {
    console.error(
      "Update payment status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getPayments,
  getPaymentById,
  updatePaymentStatus
};