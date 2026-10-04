const Invoice = require("../models/Invoice");
const Client = require("../models/Client");
const Payment = require("../models/Payment");


const generateInvoiceNumber = async () => {
  const latestInvoice = await Invoice.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  if (!latestInvoice) {
    return "INV-000001";
  }

  const latestNumber = parseInt(
    latestInvoice.invoiceNumber.replace("INV-", ""),
    10
  );

  const nextNumber = latestNumber + 1;

  return `INV-${String(nextNumber).padStart(6, "0")}`;
};


const createInvoice = async (req, res) => {
  try {
    const {
      clientId,
      paymentId,
      amount,
      currency,
      description,
      dueDate
    } = req.body;

    if (!clientId || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Client and amount are required"
      });
    }

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

    let payment = null;

    if (paymentId) {
      payment = await Payment.findOne({
        _id: paymentId,
        therapist: req.therapistId,
        client: clientId
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment not found"
        });
      }
    }

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      therapist: req.therapistId,
      client: clientId,
      payment: payment ? payment._id : null,
      invoiceNumber,
      amount: Number(amount),
      currency: currency || "INR",
      status: payment && payment.status === "paid"
        ? "paid"
        : "issued",
      dueDate: dueDate || null,
      description: description || ""
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice
    });
  } catch (error) {
    console.error("Create invoice error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getInvoices = async (req, res) => {
  try {
    const { status, clientId } = req.query;

    const query = {
      therapist: req.therapistId
    };

    if (status) {
      query.status = status;
    }

    if (clientId) {
      query.client = clientId;
    }

    const invoices = await Invoice.find(query)
      .populate("client", "name email")
      .populate("payment", "amount status paymentMethod")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices
    });
  } catch (error) {
    console.error("Get invoices error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const invoice = await Invoice.findOne({
      _id: id,
      therapist: req.therapistId
    })
      .populate("client", "name email")
      .populate("payment", "amount status paymentMethod");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error("Get invoice error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "draft",
      "issued",
      "paid",
      "cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice status"
      });
    }

    const invoice = await Invoice.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    invoice.status = status;

    await invoice.save();

    res.json({
      success: true,
      message: "Invoice status updated successfully",
      invoice
    });
  } catch (error) {
    console.error("Update invoice status error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus
};