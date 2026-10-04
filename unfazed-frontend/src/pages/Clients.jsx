import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  ChevronRight,
  UserPlus,
  X,
  Eye,
  Copy,
  Check
} from "lucide-react";

import api from "../services/api";
import "./Clients.css";

function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Client
  const [showAddClient, setShowAddClient] = useState(false);
  const [savingClient, setSavingClient] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Three-dot menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // Client details
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientDetails, setShowClientDetails] = useState(false);

  // Copy notification
  const [copiedEmail, setCopiedEmail] = useState("");

  // ---------------------------------------
  // LOAD CLIENTS
  // ---------------------------------------

  const loadClients = async () => {
    try {
      setLoading(true);
      setError("");

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
    } catch (error) {
      console.error("Failed to load clients:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load clients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // ---------------------------------------
  // FILTER CLIENTS
  // ---------------------------------------

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return clients;
    }

    return clients.filter((client) => {
      const name = client.name || "";
      const email = client.email || "";
      const phone = client.phone || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query)
      );
    });
  }, [clients, search]);

  // ---------------------------------------
  // SUMMARY
  // ---------------------------------------

  const totalClients = clients.length;

  const newClients = clients.filter((client) => {
    if (!client.createdAt) return false;

    const createdDate = new Date(client.createdAt);
    const now = new Date();

    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const activeClients = clients.filter(
    (client) =>
      client.status?.toLowerCase() === "active" ||
      !client.status
  ).length;

  // ---------------------------------------
  // ADD CLIENT
  // ---------------------------------------

  const handleOpenAddClient = () => {
    setError("");
    setSuccessMessage("");

    setClientForm({
      name: "",
      email: "",
      phone: ""
    });

    setShowAddClient(true);
  };

  const handleCloseAddClient = () => {
    if (savingClient) return;

    setShowAddClient(false);

    setClientForm({
      name: "",
      email: "",
      phone: ""
    });
  };

  const handleClientFormChange = (event) => {
    const { name, value } = event.target;

    setClientForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleAddClient = async (event) => {
    event.preventDefault();

    const name = clientForm.name.trim();
    const email = clientForm.email.trim().toLowerCase();
    const phone = clientForm.phone.trim();

    if (!name) {
      setError("Please enter the client's name.");
      return;
    }

    if (!email) {
      setError("Please enter the client's email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setSavingClient(true);
      setError("");
      setSuccessMessage("");

      await api.post("/clients", {
        name,
        email,
        phone
      });

      await loadClients();

      setShowAddClient(false);

      setClientForm({
        name: "",
        email: "",
        phone: ""
      });

      setSuccessMessage("Client added successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Failed to add client:", error);

      setError(
        error.response?.data?.message ||
          "Unable to add client. Please try again."
      );
    } finally {
      setSavingClient(false);
    }
  };

  // ---------------------------------------
  // THREE DOT MENU
  // ---------------------------------------

  const handleToggleMenu = (clientId) => {
    setOpenMenuId((previous) =>
      previous === clientId ? null : clientId
    );
  };

  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
    setOpenMenuId(null);
  };

  const handleCloseClientDetails = () => {
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  // ---------------------------------------
  // COPY EMAIL
  // ---------------------------------------

  const handleCopyEmail = async (email) => {
    if (!email || email === "No email") {
      return;
    }

    try {
      await navigator.clipboard.writeText(email);

      setCopiedEmail(email);
      setOpenMenuId(null);

      setTimeout(() => {
        setCopiedEmail("");
      }, 2000);
    } catch (error) {
      console.error("Failed to copy email:", error);

      setError("Unable to copy email address.");
    }
  };

  // ---------------------------------------
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // ---------------------------------------

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (
        !event.target.closest(".client-menu-wrapper")
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleDocumentClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleDocumentClick
      );
    };
  }, []);

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            PRACTICE
          </p>

          <h1>
            Clients
          </h1>

          <p className="dashboard-subtitle">
            Manage your clients, intake information and session history.
          </p>

        </div>

        <div className="header-actions">

          <button
            className="new-button"
            type="button"
            onClick={handleOpenAddClient}
          >
            <Plus size={18} />
            Add Client
          </button>

        </div>

      </header>

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {successMessage && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#e8f7f4",
            color: "#17766f",
            border: "1px solid #ccebe6",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          {successMessage}
        </div>
      )}

      {/* COPY TOAST */}

      {copiedEmail && (
        <div
          style={{
            position: "fixed",
            right: "24px",
            bottom: "24px",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            gap: "9px",
            padding: "12px 16px",
            background: "#173f46",
            color: "#ffffff",
            borderRadius: "10px",
            boxShadow:
              "0 12px 30px rgba(15, 23, 42, 0.18)",
            fontSize: "14px",
            fontWeight: 600
          }}
        >
          <Check size={16} />
          Email copied successfully
        </div>
      )}

      {/* CLIENT SUMMARY */}

      <section className="client-summary-grid">

        <div className="client-summary-card">

          <div className="client-summary-icon">
            <Users size={20} />
          </div>

          <div>
            <span>Total clients</span>

            <strong>
              {loading ? "—" : totalClients}
            </strong>
          </div>

        </div>

        <div className="client-summary-card">

          <div className="client-summary-icon">
            <UserPlus size={20} />
          </div>

          <div>
            <span>New this month</span>

            <strong>
              {loading ? "—" : newClients}
            </strong>
          </div>

        </div>

        <div className="client-summary-card">

          <div className="client-summary-icon">
            <Mail size={20} />
          </div>

          <div>
            <span>Active clients</span>

            <strong>
              {loading ? "—" : activeClients}
            </strong>
          </div>

        </div>

      </section>

      {/* CLIENT LIST */}

      <div className="dashboard-card clients-card">

        <div className="clients-toolbar">

          <div className="clients-toolbar-title">

            <div>

              <h2>
                All clients
              </h2>

              <p>
                {loading
                  ? "Loading clients..."
                  : `${filteredClients.length} clients shown`}
              </p>

            </div>

          </div>

          <div className="client-search">

            <Search size={17} />

            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        <div className="client-table-header">

          <span>CLIENT</span>
          <span>CONTACT</span>
          <span>LAST SESSION</span>
          <span>SESSIONS</span>
          <span>STATUS</span>
          <span></span>

        </div>

        <div className="client-list">

          {loading ? (

            <div className="empty-state">
              Loading clients...
            </div>

          ) : filteredClients.length === 0 ? (

            <div className="empty-state">

              {search
                ? "No clients match your search."
                : "No clients found."}

            </div>

          ) : (

            filteredClients.map((client) => {

              const clientId =
                client._id ||
                client.id ||
                client.email;

              const name =
                client.name ||
                "Unnamed Client";

              const email =
                client.email ||
                "No email";

              const phone =
                client.phone ||
                "No phone";

              const status =
                client.status ||
                "Active";

              return (

                <div
                  className="client-row"
                  key={clientId}
                >

                  {/* CLIENT */}

                  <div className="client-name-cell">

                    <div className="client-avatar">

                      {name
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <strong>
                        {name}
                      </strong>

                      <span>
                        {email}
                      </span>

                    </div>

                  </div>

                  {/* CONTACT */}

                  <div className="client-contact">

                    <span>
                      <Mail size={13} />
                      {email}
                    </span>

                    <span>
                      <Phone size={13} />
                      {phone}
                    </span>

                  </div>

                  {/* LAST SESSION */}

                  <div className="client-last-session">
                    {client.lastSession || "—"}
                  </div>

                  {/* SESSIONS */}

                  <div className="client-sessions">
                    {client.sessions ?? "—"}
                  </div>

                  {/* STATUS */}

                  <span
                    className={`client-status ${
                      status.toLowerCase() === "new"
                        ? "new"
                        : ""
                    }`}
                  >
                    {status}
                  </span>

                  {/* THREE DOT MENU */}

                  <div
                    className="client-menu-wrapper"
                    style={{
                      position: "relative"
                    }}
                  >

                    <button
                      className="client-menu"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        handleToggleMenu(
                          clientId
                        );
                      }}
                      aria-label={
                        `Actions for ${name}`
                      }
                    >
                      <MoreHorizontal size={17} />
                    </button>

                    {openMenuId === clientId && (

                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top:
                            "calc(100% + 6px)",
                          width: "175px",
                          background: "#ffffff",
                          border:
                            "1px solid #dce9e7",
                          borderRadius: "12px",
                          boxShadow:
                            "0 14px 35px rgba(15, 23, 42, 0.14)",
                          padding: "6px",
                          zIndex: 1000
                        }}
                      >

                        {/* VIEW DETAILS */}

                        <button
                          type="button"
                          onClick={() =>
                            handleViewClient(
                              client
                            )
                          }
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            border: "none",
                            background:
                              "transparent",
                            padding:
                              "10px 11px",
                            borderRadius: "8px",
                            color: "#234b52",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >

                          <Eye size={15} />

                          View Details

                        </button>

                        {/* COPY EMAIL */}

                        <button
                          type="button"
                          onClick={() =>
                            handleCopyEmail(
                              email
                            )
                          }
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "9px",
                            border: "none",
                            background:
                              "transparent",
                            padding:
                              "10px 11px",
                            borderRadius: "8px",
                            color: "#234b52",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            textAlign: "left"
                          }}
                        >

                          {copiedEmail ===
                          email ? (
                            <Check size={15} />
                          ) : (
                            <Copy size={15} />
                          )}

                          {copiedEmail ===
                          email
                            ? "Copied"
                            : "Copy Email"}

                        </button>

                      </div>

                    )}

                  </div>

                </div>
              );
            })

          )}

        </div>

        {/* FOOTER */}

        <div className="clients-footer">

          <span>
            {loading
              ? "Loading..."
              : `Showing ${filteredClients.length} of ${totalClients} clients`}
          </span>

          <button
            className="view-all-button"
            type="button"
          >
            View all clients
            <ChevronRight size={15} />
          </button>

        </div>

      </div>

      {/* ===================================== */}
      {/* ADD CLIENT MODAL */}
      {/* ===================================== */}

      {showAddClient && (

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
            zIndex: 2000
          }}
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseAddClient();
            }

          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.22)",
              overflow: "hidden"
            }}
          >

            {/* HEADER */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                padding:
                  "22px 24px",
                borderBottom:
                  "1px solid #e6eeee"
              }}
            >

              <div>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    color: "#0f3d45"
                  }}
                >
                  Add Client
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    fontSize: "13px",
                    color: "#71858a"
                  }}
                >
                  Create a new client record for your practice.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleCloseAddClient
                }
                disabled={savingClient}
                style={{
                  width: "36px",
                  height: "36px",
                  border: "none",
                  borderRadius: "9px",
                  background: "#f1f7f6",
                  color: "#557277",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor:
                    savingClient
                      ? "not-allowed"
                      : "pointer"
                }}
              >
                <X size={18} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddClient}
              style={{
                padding: "24px"
              }}
            >

              {/* NAME */}

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
                      "13px",
                    fontWeight: 600,
                    color:
                      "#234b52"
                  }}
                >
                  Client name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    clientForm.name
                  }
                  onChange={
                    handleClientFormChange
                  }
                  placeholder={
                    "Enter client name"
                  }
                  disabled={
                    savingClient
                  }
                  autoFocus
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px 13px",
                    border:
                      "1px solid #d7e5e3",
                    borderRadius:
                      "10px",
                    outline: "none",
                    fontSize:
                      "14px",
                    color:
                      "#173f46"
                  }}
                />

              </div>

              {/* EMAIL */}

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
                      "13px",
                    fontWeight: 600,
                    color:
                      "#234b52"
                  }}
                >
                  Email address *
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    clientForm.email
                  }
                  onChange={
                    handleClientFormChange
                  }
                  placeholder={
                    "client@example.com"
                  }
                  disabled={
                    savingClient
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px 13px",
                    border:
                      "1px solid #d7e5e3",
                    borderRadius:
                      "10px",
                    outline: "none",
                    fontSize:
                      "14px",
                    color:
                      "#173f46"
                  }}
                />

              </div>

              {/* PHONE */}

              <div
                style={{
                  marginBottom:
                    "26px"
                }}
              >

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontSize:
                      "13px",
                    fontWeight: 600,
                    color:
                      "#234b52"
                  }}
                >
                  Phone number
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    clientForm.phone
                  }
                  onChange={
                    handleClientFormChange
                  }
                  placeholder={
                    "Enter phone number"
                  }
                  disabled={
                    savingClient
                  }
                  style={{
                    width: "100%",
                    boxSizing:
                      "border-box",
                    padding:
                      "12px 13px",
                    border:
                      "1px solid #d7e5e3",
                    borderRadius:
                      "10px",
                    outline: "none",
                    fontSize:
                      "14px",
                    color:
                      "#173f46"
                  }}
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
                    handleCloseAddClient
                  }
                  disabled={
                    savingClient
                  }
                  style={{
                    border:
                      "1px solid #d5e3e1",
                    background:
                      "#ffffff",
                    color:
                      "#49666b",
                    padding:
                      "11px 18px",
                    borderRadius:
                      "10px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    cursor:
                      savingClient
                        ? "not-allowed"
                        : "pointer"
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    savingClient
                  }
                  style={{
                    border: "none",
                    background:
                      "#258f89",
                    color:
                      "#ffffff",
                    padding:
                      "11px 20px",
                    borderRadius:
                      "10px",
                    fontSize:
                      "14px",
                    fontWeight: 600,
                    cursor:
                      savingClient
                        ? "not-allowed"
                        : "pointer",
                    minWidth:
                      "125px"
                  }}
                >
                  {savingClient
                    ? "Adding..."
                    : "Add Client"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ===================================== */}
      {/* CLIENT DETAILS MODAL */}
      {/* ===================================== */}

      {showClientDetails &&
        selectedClient && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background:
                "rgba(15, 23, 42, 0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              padding: "24px",
              zIndex: 2100
            }}
            onMouseDown={(event) => {

              if (
                event.target ===
                event.currentTarget
              ) {
                handleCloseClientDetails();
              }

            }}
          >

            <div
              style={{
                width: "100%",
                maxWidth: "560px",
                background:
                  "#ffffff",
                borderRadius:
                  "20px",
                boxShadow:
                  "0 24px 70px rgba(15, 23, 42, 0.22)",
                overflow:
                  "hidden"
              }}
            >

              {/* DETAILS HEADER */}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  padding:
                    "22px 24px",
                  borderBottom:
                    "1px solid #e6eeee"
                }}
              >

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "13px"
                  }}
                >

                  <div
                    style={{
                      width: "46px",
                      height: "46px",
                      borderRadius:
                        "13px",
                      background:
                        "#e8f7f4",
                      color:
                        "#258f89",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      fontWeight: 700,
                      fontSize:
                        "18px"
                    }}
                  >
                    {(selectedClient.name ||
                      "C")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <h2
                      style={{
                        margin: 0,
                        fontSize:
                          "20px",
                        color:
                          "#0f3d45"
                      }}
                    >
                      {selectedClient.name ||
                        "Unnamed Client"}
                    </h2>

                    <p
                      style={{
                        margin:
                          "5px 0 0",
                        fontSize:
                          "13px",
                        color:
                          "#71858a"
                      }}
                    >
                      Client details
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleCloseClientDetails
                  }
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "none",
                    borderRadius:
                      "9px",
                    background:
                      "#f1f7f6",
                    color:
                      "#557277",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    cursor:
                      "pointer"
                  }}
                >
                  <X size={18} />
                </button>

              </div>

              {/* DETAILS */}

              <div
                style={{
                  padding: "24px"
                }}
              >

                <div
                  style={{
                    display:
                      "grid",
                    gap: "14px"
                  }}
                >

                  {/* EMAIL */}

                  <div
                    style={{
                      padding:
                        "15px",
                      borderRadius:
                        "12px",
                      background:
                        "#f7faf9",
                      border:
                        "1px solid #e4eeec"
                    }}
                  >

                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "12px",
                        color:
                          "#71858a",
                        marginBottom:
                          "5px"
                      }}
                    >
                      Email
                    </span>

                    <strong
                      style={{
                        color:
                          "#234b52",
                        fontSize:
                          "14px"
                      }}
                    >
                      {selectedClient.email ||
                        "No email"}
                    </strong>

                  </div>

                  {/* PHONE */}

                  <div
                    style={{
                      padding:
                        "15px",
                      borderRadius:
                        "12px",
                      background:
                        "#f7faf9",
                      border:
                        "1px solid #e4eeec"
                    }}
                  >

                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "12px",
                        color:
                          "#71858a",
                        marginBottom:
                          "5px"
                      }}
                    >
                      Phone
                    </span>

                    <strong
                      style={{
                        color:
                          "#234b52",
                        fontSize:
                          "14px"
                      }}
                    >
                      {selectedClient.phone ||
                        "No phone"}
                    </strong>

                  </div>

                  {/* STATUS + SESSIONS */}

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "14px"
                    }}
                  >

                    <div
                      style={{
                        padding:
                          "15px",
                        borderRadius:
                          "12px",
                        background:
                          "#f7faf9",
                        border:
                          "1px solid #e4eeec"
                      }}
                    >

                      <span
                        style={{
                          display:
                            "block",
                          fontSize:
                            "12px",
                          color:
                            "#71858a",
                          marginBottom:
                            "5px"
                        }}
                      >
                        Status
                      </span>

                      <strong
                        style={{
                          color:
                            "#234b52",
                          fontSize:
                            "14px"
                        }}
                      >
                        {selectedClient.status ||
                          "Active"}
                      </strong>

                    </div>

                    <div
                      style={{
                        padding:
                          "15px",
                        borderRadius:
                          "12px",
                        background:
                          "#f7faf9",
                        border:
                          "1px solid #e4eeec"
                      }}
                    >

                      <span
                        style={{
                          display:
                            "block",
                          fontSize:
                            "12px",
                          color:
                            "#71858a",
                          marginBottom:
                            "5px"
                        }}
                      >
                        Sessions
                      </span>

                      <strong
                        style={{
                          color:
                            "#234b52",
                          fontSize:
                            "14px"
                        }}
                      >
                        {selectedClient.sessions ??
                          "—"}
                      </strong>

                    </div>

                  </div>

                  {/* LAST SESSION */}

                  <div
                    style={{
                      padding:
                        "15px",
                      borderRadius:
                        "12px",
                      background:
                        "#f7faf9",
                      border:
                        "1px solid #e4eeec"
                    }}
                  >

                    <span
                      style={{
                        display:
                          "block",
                        fontSize:
                          "12px",
                        color:
                          "#71858a",
                        marginBottom:
                          "5px"
                      }}
                    >
                      Last session
                    </span>

                    <strong
                      style={{
                        color:
                          "#234b52",
                        fontSize:
                          "14px"
                      }}
                    >
                      {selectedClient.lastSession ||
                        "No sessions yet"}
                    </strong>

                  </div>

                </div>

                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "flex-end",
                    marginTop:
                      "22px"
                  }}
                >

                  <button
                    type="button"
                    onClick={
                      handleCloseClientDetails
                    }
                    style={{
                      border: "none",
                      background:
                        "#258f89",
                      color:
                        "#ffffff",
                      padding:
                        "11px 20px",
                      borderRadius:
                        "10px",
                      fontSize:
                        "14px",
                      fontWeight: 600,
                      cursor:
                        "pointer"
                    }}
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Clients;