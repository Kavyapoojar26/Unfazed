import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  X,
  Save,
  Copy,
  Eye
} from "lucide-react";

import api from "../services/api";
import "./Invoices.css";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    clientId: "",
    amount: "",
    description: "Therapy session payment",
    status: "issued",
    dueDate: ""
  });

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");
      const data = response.data;

      const invoiceList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.invoices)
            ? data.invoices
            : Array.isArray(data.data)
              ? data.data
              : [];

      setInvoices(invoiceList);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      setError(
        error.response?.data?.message ||
          "Unable to load invoices. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Failed to load clients:", error);
      setError(
        error.response?.data?.message ||
          "Unable to load clients."
      );
      return [];
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const getClientName = (invoice) => {
    if (invoice.client?.name) return invoice.client.name;
    if (invoice.clientName) return invoice.clientName;
    if (invoice.client?.fullName) return invoice.client.fullName;
    return "Client";
  };

  const getInvoiceId = (invoice) => {
    return (
      invoice.invoiceNumber ||
      invoice.invoiceId ||
      invoice.number ||
      invoice.id ||
      "Invoice"
    );
  };

  const getAmountValue = (invoice) => {
    const amount =
      invoice.amount ??
      invoice.totalAmount ??
      invoice.total ??
      invoice.grandTotal ??
      0;

    const numericAmount = Number(amount);
    return Number.isNaN(numericAmount) ? 0 : numericAmount;
  };

  const formatAmount = (invoice) => {
    const numericAmount = getAmountValue(invoice);
    return `₹${numericAmount.toLocaleString("en-IN")}`;
  };

  const getStatus = (invoice) => {
    const status = invoice.status || "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getInvoiceDate = (invoice) => {
    return (
      invoice.date ||
      invoice.invoiceDate ||
      invoice.createdAt ||
      invoice.updatedAt
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return invoices;

    return invoices.filter((invoice) => {
      const client = getClientName(invoice).toLowerCase();
      const invoiceId = getInvoiceId(invoice).toLowerCase();
      const status = getStatus(invoice).toLowerCase();
      const amount = formatAmount(invoice).toLowerCase();

      return (
        client.includes(query) ||
        invoiceId.includes(query) ||
        status.includes(query) ||
        amount.includes(query)
      );
    });
  }, [invoices, search]);

  const paidInvoices = invoices.filter((invoice) => {
    const status = getStatus(invoice).toLowerCase();
    return status === "paid" || status === "completed" || status === "success";
  });

  const pendingInvoices = invoices.filter((invoice) => {
    const status = getStatus(invoice).toLowerCase();
    return (
      status === "pending" ||
      status === "unpaid" ||
      status === "created" ||
      status === "issued"
    );
  });

  const handleOpenCreateInvoice = async () => {
    setError("");
    setOpenMenuId(null);

    setForm({
      clientId: "",
      amount: "",
      description: "Therapy session payment",
      status: "issued",
      dueDate: ""
    });

    await loadClients();
    setShowCreateInvoice(true);
  };

  const handleCloseCreateInvoice = () => {
    if (saving) return;
    setShowCreateInvoice(false);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleCreateInvoice = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.clientId) {
      setError("Please select a client.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid invoice amount.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        clientId: form.clientId,
        amount: Number(form.amount),
        description: form.description.trim() || "Therapy session payment",
        status: form.status
      };

      if (form.dueDate) {
        payload.dueDate = form.dueDate;
      }

      await api.post("/invoices", payload);

      setShowCreateInvoice(false);
      setToast("Invoice created successfully");

      await loadInvoices();

      window.setTimeout(() => {
        setToast("");
      }, 2500);
    } catch (error) {
      console.error("Failed to create invoice:", error);
      setError(
        error.response?.data?.message ||
          "Unable to create invoice. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenMenuId(null);
  };

  const handleCopyInvoiceNumber = async (invoice) => {
    const invoiceId = getInvoiceId(invoice);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(invoiceId);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = invoiceId;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setToast("Invoice number copied successfully");
    } catch (error) {
      console.error("Failed to copy invoice number:", error);
      setToast("Unable to copy invoice number");
    }

    setOpenMenuId(null);

    window.setTimeout(() => {
      setToast("");
    }, 2500);
  };

  const closeDetails = () => {
    setSelectedInvoice(null);
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">PRACTICE</p>
          <h1>Invoices</h1>
          <p className="dashboard-subtitle">
            Manage invoices, billing and payment records.
          </p>
        </div>

        <div className="header-actions">
          <button
            className="new-button"
            type="button"
            onClick={handleOpenCreateInvoice}
          >
            <Plus size={18} />
            New Invoice
          </button>
        </div>
      </header>

      {error && <div className="auth-error">{error}</div>}

      {toast && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 2000,
            background: "#173f4b",
            color: "#ffffff",
            padding: "12px 16px",
            borderRadius: "10px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          {toast}
        </div>
      )}

      <section className="invoice-summary-grid">
        <div className="invoice-summary-card">
          <div className="invoice-summary-icon">
            <FileText size={20} />
          </div>
          <div>
            <span>Total invoices</span>
            <strong>{loading ? "—" : invoices.length}</strong>
          </div>
        </div>

        <div className="invoice-summary-card">
          <div className="invoice-summary-icon">
            <FileText size={20} />
          </div>
          <div>
            <span>Paid</span>
            <strong>{loading ? "—" : paidInvoices.length}</strong>
          </div>
        </div>

        <div className="invoice-summary-card">
          <div className="invoice-summary-icon">
            <FileText size={20} />
          </div>
          <div>
            <span>Pending</span>
            <strong>{loading ? "—" : pendingInvoices.length}</strong>
          </div>
        </div>
      </section>

      <div className="dashboard-card invoices-card">
        <div className="invoices-toolbar">
          <div>
            <h2>Recent invoices</h2>
            <p>
              {loading
                ? "Loading invoices..."
                : `${filteredInvoices.length} invoices shown`}
            </p>
          </div>

          <div className="invoices-search">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="invoice-table-header">
          <span>CLIENT</span>
          <span>INVOICE</span>
          <span>AMOUNT</span>
          <span>DATE</span>
          <span>STATUS</span>
          <span></span>
        </div>

        <div className="invoice-list">
          {loading ? (
            <div className="empty-state">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="empty-state">
              {search ? "No invoices match your search." : "No invoices found."}
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const clientName = getClientName(invoice);
              const status = getStatus(invoice);
              const invoiceId = getInvoiceId(invoice);
              const invoiceDate = getInvoiceDate(invoice);
              const normalizedStatus = status.toLowerCase();

              const isPending =
                normalizedStatus === "pending" ||
                normalizedStatus === "unpaid" ||
                normalizedStatus === "created" ||
                normalizedStatus === "issued";

              const invoiceKey = invoice._id || invoice.id || invoiceId;

              return (
                <div
                  className="invoice-row"
                  key={invoiceKey}
                  style={{ position: "relative" }}
                >
                  <div className="invoice-client">
                    <div className="invoice-avatar">
                      {clientName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{clientName}</strong>
                      <span>
                        {invoice.description ||
                          invoice.type ||
                          "Therapy session payment"}
                      </span>
                    </div>
                  </div>

                  <div className="invoice-id">{invoiceId}</div>
                  <div className="invoice-amount">{formatAmount(invoice)}</div>
                  <div className="invoice-date">{formatDate(invoiceDate)}</div>

                  <span
                    className={`invoice-status ${isPending ? "pending" : ""}`}
                  >
                    {status}
                  </span>

                  <button
                    className="invoice-menu"
                    title="More options"
                    type="button"
                    onClick={() =>
                      setOpenMenuId((current) =>
                        current === invoiceKey ? null : invoiceKey
                      )
                    }
                  >
                    <MoreHorizontal size={18} />
                  </button>

                  {openMenuId === invoiceKey && (
                    <div
                      style={{
                        position: "absolute",
                        right: "44px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        minWidth: "170px",
                        background: "#ffffff",
                        border: "1px solid #dce9e7",
                        borderRadius: "10px",
                        boxShadow: "0 14px 35px rgba(15, 23, 42, 0.16)",
                        padding: "6px",
                        zIndex: 50
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleViewDetails(invoice)}
                        style={menuButtonStyle}
                      >
                        <Eye size={15} />
                        View details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyInvoiceNumber(invoice)}
                        style={menuButtonStyle}
                      >
                        <Copy size={15} />
                        Copy invoice number
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="invoices-footer">
          <span>
            {loading
              ? "Loading..."
              : `Showing ${filteredInvoices.length} of ${invoices.length} invoices`}
          </span>

          <button
            className="view-all-button"
            type="button"
            onClick={() => setSearch("")}
          >
            View all invoices
          </button>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {showCreateInvoice && (
        <div
          style={overlayStyle}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseCreateInvoice();
            }
          }}
        >
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <p style={eyebrowStyle}>PRACTICE</p>
                <h2 style={modalTitleStyle}>New Invoice</h2>
                <p style={modalSubtitleStyle}>
                  Create an invoice for a client.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseCreateInvoice}
                disabled={saving}
                style={closeButtonStyle}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Client</label>
                <select
                  name="clientId"
                  value={form.clientId}
                  onChange={handleFormChange}
                  required
                  style={inputStyle}
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option
                      key={client._id || client.id}
                      value={client._id || client.id}
                    >
                      {client.name} — {client.email}
                    </option>
                  ))}
                </select>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Amount</label>
                <div style={{ position: "relative" }}>
                  <span style={rupeeStyle}>₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleFormChange}
                    placeholder="1500"
                    min="1"
                    step="0.01"
                    required
                    style={{ ...inputStyle, paddingLeft: "30px" }}
                  />
                </div>
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Therapy session payment"
                  style={inputStyle}
                />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  style={inputStyle}
                >
                  <option value="issued">Issued</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div style={fieldStyleLast}>
                <label style={labelStyle}>Due date (optional)</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleFormChange}
                  style={inputStyle}
                />
              </div>

              <div style={actionsStyle}>
                <button
                  type="button"
                  onClick={handleCloseCreateInvoice}
                  disabled={saving}
                  style={cancelButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || clients.length === 0}
                  style={{
                    ...saveButtonStyle,
                    opacity: saving || clients.length === 0 ? 0.6 : 1
                  }}
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedInvoice && (
        <div style={overlayStyle} onMouseDown={closeDetails}>
          <div
            style={detailsModalStyle}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div style={modalHeaderStyle}>
              <div>
                <p style={eyebrowStyle}>INVOICE</p>
                <h2 style={modalTitleStyle}>Invoice details</h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                style={closeButtonStyle}
              >
                <X size={19} />
              </button>
            </div>

            <div style={detailsGridStyle}>
              <Detail label="Client" value={getClientName(selectedInvoice)} />
              <Detail label="Invoice number" value={getInvoiceId(selectedInvoice)} />
              <Detail label="Amount" value={formatAmount(selectedInvoice)} />
              <Detail label="Status" value={getStatus(selectedInvoice)} />
              <Detail
                label="Date"
                value={formatDate(getInvoiceDate(selectedInvoice))}
              />
              <Detail
                label="Description"
                value={
                  selectedInvoice.description ||
                  selectedInvoice.type ||
                  "Therapy session payment"
                }
              />
            </div>

            <div style={detailsActionsStyle}>
              <button
                type="button"
                onClick={() => handleCopyInvoiceNumber(selectedInvoice)}
                style={secondaryActionStyle}
              >
                <Copy size={16} />
                Copy invoice number
              </button>

              <button
                type="button"
                onClick={closeDetails}
                style={primaryActionStyle}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span
        style={{
          display: "block",
          color: "#71808a",
          fontSize: "13px",
          marginBottom: "5px"
        }}
      >
        {label}
      </span>
      <strong
        style={{
          display: "block",
          color: "#173f4b",
          fontSize: "15px"
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const menuButtonStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  borderRadius: "8px",
  padding: "10px 11px",
  display: "flex",
  alignItems: "center",
  gap: "9px",
  color: "#173f4b",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left"
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 1000
};

const modalStyle = {
  width: "100%",
  maxWidth: "620px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "18px",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
  padding: "28px"
};

const detailsModalStyle = {
  width: "100%",
  maxWidth: "560px",
  background: "#ffffff",
  borderRadius: "18px",
  boxShadow: "0 24px 70px rgba(15, 23, 42, 0.22)",
  padding: "28px"
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "24px"
};

const eyebrowStyle = {
  margin: "0 0 6px",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "1.2px",
  color: "#258f89"
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "25px",
  color: "#123d4a"
};

const modalSubtitleStyle = {
  margin: "7px 0 0",
  color: "#71808a",
  fontSize: "14px"
};

const closeButtonStyle = {
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
};

const fieldStyle = {
  marginBottom: "18px"
};

const fieldStyleLast = {
  marginBottom: "24px"
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "14px",
  fontWeight: 600,
  color: "#173f4b"
};

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

const rupeeStyle = {
  position: "absolute",
  left: "13px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#71808a",
  fontWeight: 600
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px"
};

const cancelButtonStyle = {
  height: "44px",
  padding: "0 18px",
  border: "1px solid #d5e3e2",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#49646d",
  fontWeight: 600,
  cursor: "pointer"
};

const saveButtonStyle = {
  height: "44px",
  padding: "0 20px",
  border: "none",
  borderRadius: "10px",
  background: "#2f918a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px"
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "22px",
  marginBottom: "28px"
};

const detailsActionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px"
};

const secondaryActionStyle = {
  height: "42px",
  padding: "0 16px",
  border: "1px solid #d5e3e2",
  borderRadius: "10px",
  background: "#ffffff",
  color: "#49646d",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "7px"
};

const primaryActionStyle = {
  height: "42px",
  padding: "0 18px",
  border: "none",
  borderRadius: "10px",
  background: "#2f918a",
  color: "#ffffff",
  fontWeight: 700,
  cursor: "pointer"
};

export default Invoices;
