import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  Search,
  Plus,
  CreditCard,
  Clock3,
  RotateCcw,
  MoreHorizontal,
  CalendarDays,
  ChevronRight,
  X,
  Save
} from "lucide-react";

import api from "../services/api";
import "./Payments.css";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showRecordPayment, setShowRecordPayment] =
    useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [copiedPaymentId, setCopiedPaymentId] = useState(null);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    amount: "",
    method: "UPI",
    status: "paid",
    description: "Therapy session"
  });

  // =========================================================
  // LOAD PAYMENTS
  // =========================================================

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/payments");

      const data = response.data;

      const paymentList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.payments)
            ? data.payments
            : Array.isArray(data.data)
              ? data.data
              : [];

      setPayments(paymentList);
    } catch (error) {
      console.error(
        "Failed to load payments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load payments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CLIENTS
  // =========================================================

  const loadClients = async () => {
    try {
      const response = await api.get("/clients");

      const data = response.data;

      const clientList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.clients)
            ? data.clients
            : Array.isArray(data.data)
              ? data.data
              : [];

      setClients(clientList);

      return clientList;
    } catch (error) {
      console.error(
        "Failed to load clients:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load clients."
      );

      return [];
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // =========================================================
  // OPEN RECORD PAYMENT
  // =========================================================

  const handleOpenRecordPayment = async () => {
    setError("");

    setForm({
      clientId: "",
      amount: "",
      method: "UPI",
      status: "paid",
      description: "Therapy session"
    });

    await loadClients();

    setShowRecordPayment(true);
  };

  // =========================================================
  // CLOSE RECORD PAYMENT
  // =========================================================

  const handleCloseRecordPayment = () => {
    if (saving) return;

    setShowRecordPayment(false);

    setForm({
      clientId: "",
      amount: "",
      method: "UPI",
      status: "paid",
      description: "Therapy session"
    });
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // =========================================================
  // RECORD PAYMENT
  // =========================================================

  const handleRecordPayment = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.clientId) {
      setError("Please select a client.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/payments", {
  clientId: form.clientId,
  amount: Number(form.amount),
  paymentMethod: form.method,
  status: form.status,
  description: form.description.trim()
});
      setShowRecordPayment(false);

      setForm({
        clientId: "",
        amount: "",
        method: "UPI",
        status: "paid",
        description: "Therapy session"
      });

      await loadPayments();
    } catch (error) {
      console.error(
        "Failed to record payment:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to record payment. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PAYMENT ACTION MENU
  // =========================================================

  const handleTogglePaymentMenu = (paymentId) => {
    setOpenMenuId((currentId) =>
      currentId === paymentId ? null : paymentId
    );
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setOpenMenuId(null);
  };

  const handleClosePaymentDetails = () => {
    setSelectedPayment(null);
  };

  const handleCopyPaymentId = async (payment) => {
    const paymentId = payment?._id || payment?.id;

    if (!paymentId) {
      setError("Payment ID is not available.");
      setOpenMenuId(null);
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(paymentId);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = paymentId;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!copied) {
          throw new Error("Copy command failed");
        }
      }

      setError("");
      setCopiedPaymentId(paymentId);
      setOpenMenuId(null);

      window.setTimeout(() => {
        setCopiedPaymentId((currentId) =>
          currentId === paymentId ? null : currentId
        );
      }, 2000);
    } catch (error) {
      console.error("Failed to copy payment ID:", error);
      setError("Unable to copy payment ID. Please copy it manually.");
      setOpenMenuId(null);
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getClientName = (payment) => {
    if (payment.client?.name) {
      return payment.client.name;
    }

    if (payment.clientName) {
      return payment.clientName;
    }

    if (payment.client?.fullName) {
      return payment.client.fullName;
    }

    return "Client";
  };

  const getAmount = (payment) => {
    const amount =
      payment.amount ??
      payment.totalAmount ??
      payment.paidAmount ??
      0;

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return String(amount);
    }

    return `₹${numericAmount.toLocaleString(
      "en-IN"
    )}`;
  };

  const getNumericAmount = (payment) => {
    const amount =
      payment.amount ??
      payment.totalAmount ??
      payment.paidAmount ??
      0;

    const numericAmount = Number(amount);

    return Number.isNaN(numericAmount)
      ? 0
      : numericAmount;
  };

  const getMethod = (payment) => {
    return (
      payment.method ||
      payment.paymentMethod ||
      payment.mode ||
      "Payment"
    );
  };

  const getStatus = (payment) => {
    const status =
      payment.status || "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  const getPaymentDate = (payment) => {
    return (
      payment.date ||
      payment.createdAt ||
      payment.paidAt ||
      payment.updatedAt
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    );
  };

  const formatTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPayments = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return payments;
    }

    return payments.filter((payment) => {
      const client =
        getClientName(payment).toLowerCase();

      const method =
        getMethod(payment).toLowerCase();

      const status =
        getStatus(payment).toLowerCase();

      const amount =
        getAmount(payment).toLowerCase();

      return (
        client.includes(query) ||
        method.includes(query) ||
        status.includes(query) ||
        amount.includes(query)
      );
    });
  }, [payments, search]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const thisMonthPayments =
    payments.filter((payment) => {
      const value =
        getPaymentDate(payment);

      if (!value) {
        return false;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      const now = new Date();

      return (
        date.getMonth() ===
          now.getMonth() &&
        date.getFullYear() ===
          now.getFullYear()
      );
    });

  const paidPayments =
    payments.filter((payment) => {
      const status =
        getStatus(payment).toLowerCase();

      return (
        status === "paid" ||
        status === "completed" ||
        status === "success" ||
        status === "successful"
      );
    });

  const pendingPayments =
    payments.filter(
      (payment) =>
        getStatus(payment).toLowerCase() ===
        "pending"
    );

  const refundedPayments =
    payments.filter(
      (payment) =>
        getStatus(payment).toLowerCase() ===
        "refunded"
    );

  const thisMonthTotal =
    thisMonthPayments.reduce(
      (total, payment) =>
        total +
        getNumericAmount(payment),
      0
    );

  const paidTotal =
    paidPayments.reduce(
      (total, payment) =>
        total +
        getNumericAmount(payment),
      0
    );

  const pendingTotal =
    pendingPayments.reduce(
      (total, payment) =>
        total +
        getNumericAmount(payment),
      0
    );

  const refundedTotal =
    refundedPayments.reduce(
      (total, payment) =>
        total +
        getNumericAmount(payment),
      0
    );

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">
            PRACTICE
          </p>

          <h1>
            Payments
          </h1>

          <p className="dashboard-subtitle">
            Track payments, revenue and transaction history.
          </p>
        </div>

        <div className="header-actions">

          <button
            className="new-button"
            type="button"
            onClick={handleOpenRecordPayment}
          >
            <Plus size={18} />
            Record Payment
          </button>

        </div>

      </header>

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* PAYMENT SUMMARY */}

      <section className="payment-summary-grid">

        <div className="payment-summary-card">

          <div className="payment-summary-icon">
            <IndianRupee size={20} />
          </div>

          <div>
            <span>
              This month
            </span>

            <strong>
              {loading
                ? "—"
                : `₹${thisMonthTotal.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

            <small>
              Revenue from this month's payments
            </small>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="payment-summary-icon">
            <CreditCard size={20} />
          </div>

          <div>
            <span>
              Paid payments
            </span>

            <strong>
              {loading
                ? "—"
                : `₹${paidTotal.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

            <small>
              {loading
                ? "Loading..."
                : `${paidPayments.length} successful transactions`}
            </small>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="payment-summary-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <span>
              Pending
            </span>

            <strong>
              {loading
                ? "—"
                : `₹${pendingTotal.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

            <small>
              {loading
                ? "Loading..."
                : `${pendingPayments.length} payments awaiting`}
            </small>
          </div>

        </div>

        <div className="payment-summary-card">

          <div className="payment-summary-icon">
            <RotateCcw size={20} />
          </div>

          <div>
            <span>
              Refunds
            </span>

            <strong>
              {loading
                ? "—"
                : `₹${refundedTotal.toLocaleString(
                    "en-IN"
                  )}`}
            </strong>

            <small>
              {loading
                ? "Loading..."
                : `${refundedPayments.length} refunded payments`}
            </small>
          </div>

        </div>

      </section>

      {/* PAYMENT HISTORY */}

      <div className="dashboard-card payments-card">

        <div className="payments-toolbar">

          <div>
            <h2>
              Payment history
            </h2>

            <p>
              {loading
                ? "Loading transactions..."
                : `${filteredPayments.length} transactions shown`}
            </p>
          </div>

          <div className="payments-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search payments..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        <div className="payment-table-header">

          <span>CLIENT</span>
          <span>AMOUNT</span>
          <span>METHOD</span>
          <span>DATE</span>
          <span>STATUS</span>
          <span></span>

        </div>

        <div className="payment-list">

          {loading ? (

            <div className="empty-state">
              Loading payments...
            </div>

          ) : filteredPayments.length === 0 ? (

            <div className="empty-state">
              {search
                ? "No payments match your search."
                : "No payments found."}
            </div>

          ) : (

            filteredPayments.map(
              (payment) => {

                const clientName =
                  getClientName(payment);

                const status =
                  getStatus(payment);

                const paymentDate =
                  getPaymentDate(payment);

                return (
                  <div
                    className="payment-row"
                    key={
                      payment._id ||
                      payment.id ||
                      `${clientName}-${paymentDate}`
                    }
                  >

                    <div className="payment-client">

                      <div className="payment-client-avatar">
                        {clientName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {clientName}
                        </strong>

                        <span>
                          {payment.description ||
                            payment.type ||
                            "Therapy session"}
                        </span>

                      </div>

                    </div>

                    <div className="payment-amount">
                      {getAmount(payment)}
                    </div>

                    <div className="payment-method">

                      <CreditCard size={13} />

                      {getMethod(payment)}

                    </div>

                    <div className="payment-date">

                      <strong>
                        {formatDate(
                          paymentDate
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          paymentDate
                        )}
                      </span>

                    </div>

                    <span
                      className={`payment-status ${
                        status.toLowerCase() ===
                        "pending"
                          ? "pending"
                          : status
                              .toLowerCase() ===
                            "refunded"
                            ? "refunded"
                            : ""
                      }`}
                    >
                      {status}
                    </span>

                    <div className="payment-menu-wrapper">
                      <button
                        className="payment-menu"
                        title="More options"
                        type="button"
                        onClick={() =>
                          handleTogglePaymentMenu(
                            payment._id || payment.id
                          )
                        }
                        aria-label="More payment options"
                        aria-expanded={
                          openMenuId ===
                          (payment._id || payment.id)
                        }
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {openMenuId ===
                        (payment._id || payment.id) && (
                        <div className="payment-action-menu">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewPayment(payment)
                            }
                          >
                            View details
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleCopyPaymentId(payment)
                            }
                          >
                            {copiedPaymentId ===
                            (payment._id || payment.id)
                              ? "Copied!"
                              : "Copy payment ID"}
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              }
            )

          )}

        </div>

        <div className="payments-footer">

          <span>
            {loading
              ? "Loading..."
              : `Showing ${filteredPayments.length} of ${payments.length} transactions`}
          </span>

          <button
            className="view-all-button"
            type="button"
          >
            View all payments
            <ChevronRight size={15} />
          </button>

        </div>

      </div>

      {/* PAYMENT INFO */}

      <div className="payment-info-card">

        <div className="payment-info-icon">
          <CalendarDays size={18} />
        </div>

        <div>

          <strong>
            Payment tracking
          </strong>

          <span>
            Payments made through your practice are recorded here for easy reconciliation.
          </span>

        </div>

      </div>

      {copiedPaymentId && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 1200,
            background: "#173f4b",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          Payment ID copied successfully
        </div>
      )}

      {/* =====================================================
          PAYMENT DETAILS MODAL
      ===================================================== */}

      {selectedPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1100
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePaymentDetails();
            }
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "18px",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
              padding: "28px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "22px"
              }}
            >
              <div>
                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1.2px",
                    color: "#258f89"
                  }}
                >
                  PAYMENT
                </p>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "25px",
                    color: "#123d4a"
                  }}
                >
                  Payment details
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClosePaymentDetails}
                style={{
                  border: "none",
                  background: "#f1f7f6",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#49646d"
                }}
              >
                <X size={19} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "14px"
              }}
            >
              <div>
                <span style={detailLabelStyle}>Client</span>
                <strong style={detailValueStyle}>
                  {getClientName(selectedPayment)}
                </strong>
              </div>

              <div>
                <span style={detailLabelStyle}>Amount</span>
                <strong style={detailValueStyle}>
                  {getAmount(selectedPayment)}
                </strong>
              </div>

              <div>
                <span style={detailLabelStyle}>Payment method</span>
                <strong style={detailValueStyle}>
                  {getMethod(selectedPayment)}
                </strong>
              </div>

              <div>
                <span style={detailLabelStyle}>Status</span>
                <strong style={detailValueStyle}>
                  {getStatus(selectedPayment)}
                </strong>
              </div>

              <div>
                <span style={detailLabelStyle}>Date</span>
                <strong style={detailValueStyle}>
                  {formatDate(getPaymentDate(selectedPayment))}
                  {" "}
                  {formatTime(getPaymentDate(selectedPayment))}
                </strong>
              </div>

              <div>
                <span style={detailLabelStyle}>Description</span>
                <strong style={detailValueStyle}>
                  {selectedPayment.description ||
                    selectedPayment.type ||
                    "Therapy session"}
                </strong>
              </div>

              {(selectedPayment._id || selectedPayment.id) && (
                <div>
                  <span style={detailLabelStyle}>Payment ID</span>
                  <strong
                    style={{
                      ...detailValueStyle,
                      wordBreak: "break-all",
                      fontSize: "13px"
                    }}
                  >
                    {selectedPayment._id || selectedPayment.id}
                  </strong>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px"
              }}
            >
              <button
                type="button"
                onClick={handleClosePaymentDetails}
                style={{
                  height: "42px",
                  padding: "0 18px",
                  border: "1px solid #d5e3e2",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#49646d",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          RECORD PAYMENT MODAL
      ===================================================== */}

      {showRecordPayment && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background:
              "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000
          }}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseRecordPayment();
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "620px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "18px",
              boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.22)",
              padding: "28px"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                marginBottom: "24px"
              }}
            >

              <div>

                <p
                  style={{
                    margin:
                      "0 0 6px",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing:
                      "1.2px",
                    color: "#258f89"
                  }}
                >
                  PRACTICE
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "25px",
                    color: "#123d4a"
                  }}
                >
                  Record Payment
                </h2>

                <p
                  style={{
                    margin:
                      "7px 0 0",
                    color: "#71808a",
                    fontSize: "14px"
                  }}
                >
                  Record a payment received from a client.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseRecordPayment
                }
                disabled={saving}
                style={{
                  border: "none",
                  background:
                    "#f1f7f6",
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color: "#49646d"
                }}
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleRecordPayment
              }
            >

              {/* CLIENT */}

              <div
                style={{
                  marginBottom:
                    "18px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    color:
                      "#173f4b"
                  }}
                >
                  Client
                </label>

                <select
                  name="clientId"
                  value={
                    form.clientId
                  }
                  onChange={
                    handleChange
                  }
                  required
                  style={
                    inputStyle
                  }
                >

                  <option value="">
                    Select a client
                  </option>

                  {clients.map(
                    (client) => (
                      <option
                        key={
                          client._id ||
                          client.id
                        }
                        value={
                          client._id ||
                          client.id
                        }
                      >
                        {client.name} — {client.email}
                      </option>
                    )
                  )}

                </select>

                {clients.length ===
                  0 && (
                  <p
                    style={{
                      margin:
                        "7px 0 0",
                      fontSize:
                        "13px",
                      color:
                        "#8a6a28"
                    }}
                  >
                    No clients are available yet.
                  </p>
                )}

              </div>

              {/* AMOUNT */}

              <div
                style={{
                  marginBottom:
                    "18px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    color:
                      "#173f4b"
                  }}
                >
                  Amount
                </label>

                <div
                  style={{
                    position:
                      "relative"
                  }}
                >

                  <span
                    style={{
                      position:
                        "absolute",
                      left: "13px",
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color:
                        "#71808a",
                      fontWeight:
                        600
                    }}
                  >
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    value={
                      form.amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="1500"
                    min="1"
                    step="0.01"
                    required
                    style={{
                      ...inputStyle,
                      paddingLeft:
                        "30px"
                    }}
                  />

                </div>

              </div>

              {/* METHOD */}

              <div
                style={{
                  marginBottom:
                    "18px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    color:
                      "#173f4b"
                  }}
                >
                  Payment Method
                </label>

                <select
                  name="method"
                  value={
                    form.method
                  }
                  onChange={
                    handleChange
                  }
                  style={
                    inputStyle
                  }
                >

                  <option value="UPI">
                    UPI
                  </option>

                  <option value="Razorpay">
                    Razorpay
                  </option>

                  <option value="Card">
                    Card
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Bank Transfer">
                    Bank Transfer
                  </option>

                </select>

              </div>

              {/* STATUS */}

              <div
                style={{
                  marginBottom:
                    "18px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    color:
                      "#173f4b"
                  }}
                >
                  Payment Status
                </label>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  style={
                    inputStyle
                  }
                >

                  <option value="paid">
                    Paid
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}

              <div
                style={{
                  marginBottom:
                    "24px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    color:
                      "#173f4b"
                  }}
                >
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Therapy session"
                  style={
                    inputStyle
                  }
                />

              </div>

              {/* ACTIONS */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "flex-end",
                  gap: "10px"
                }}
              >

                <button
                  type="button"
                  onClick={
                    handleCloseRecordPayment
                  }
                  disabled={saving}
                  style={{
                    height: "44px",
                    padding:
                      "0 18px",
                    border:
                      "1px solid #d5e3e2",
                    borderRadius:
                      "10px",
                    background:
                      "#ffffff",
                    color:
                      "#49646d",
                    fontWeight:
                      600,
                    cursor:
                      saving
                        ? "not-allowed"
                        : "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    clients.length ===
                      0
                  }
                  style={{
                    height: "44px",
                    padding:
                      "0 20px",
                    border: "none",
                    borderRadius:
                      "10px",
                    background:
                      saving ||
                      clients.length ===
                        0
                        ? "#a9c8c5"
                        : "#2f918a",
                    color:
                      "#ffffff",
                    fontWeight:
                      700,
                    cursor:
                      saving ||
                      clients.length ===
                        0
                        ? "not-allowed"
                        : "pointer",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px"
                  }}
                >

                  <Save size={17} />

                  {saving
                    ? "Saving..."
                    : "Record Payment"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

// =========================================================
// FORM STYLE
// =========================================================

const inputStyle = {
  width: "100%",
  height: "46px",
  border: "1px solid #d5e3e2",
  borderRadius: "10px",
  padding: "0 13px",
  fontSize: "14px",
  color: "#173f4b",
  background: "#ffffff",
  outline: "none",
  boxSizing: "border-box"
};

const detailLabelStyle = {
  display: "block",
  marginBottom: "4px",
  fontSize: "12px",
  color: "#71808a"
};

const detailValueStyle = {
  display: "block",
  fontSize: "14px",
  color: "#173f4b"
};

export default Payments;