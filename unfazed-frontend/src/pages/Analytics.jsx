import { useEffect, useState } from "react";
import {
  TrendingUp,
  Users,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  X
} from "lucide-react";

import api from "../services/api";
import "./Analytics.css";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showOverview, setShowOverview] = useState(false);

  // =========================================================
  // LOAD ANALYTICS
  // =========================================================

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/analytics/overview");

      const data = response.data;

      setAnalytics(data?.analytics || {});
    } catch (error) {
      console.error("Failed to load analytics:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatNumber = (value) => {
    const number = Number(value || 0);

    return number.toLocaleString("en-IN");
  };

  const formatCurrency = (value) => {
    const number = Number(value || 0);

    return `₹${number.toLocaleString("en-IN")}`;
  };

  // =========================================================
  // ANALYTICS VALUES
  // =========================================================

  const totalClients =
    analytics?.totalClients ?? 0;

  const totalBookings =
    analytics?.totalBookings ?? 0;

  const completedSessions =
    analytics?.completedSessions ?? 0;

  const cancelledBookings =
    analytics?.cancelledBookings ?? 0;

  const totalRevenue =
    analytics?.totalRevenue ?? 0;

  const completionRate =
    totalBookings > 0
      ? (completedSessions / totalBookings) * 100
      : 0;

  const otherBookings = Math.max(
    totalBookings -
      completedSessions -
      cancelledBookings,
    0
  );

  // =========================================================
  // OPEN PRACTICE OVERVIEW
  // =========================================================

  const handleOpenOverview = () => {
    setShowOverview(true);
  };

  // =========================================================
  // CLOSE PRACTICE OVERVIEW
  // =========================================================

  const handleCloseOverview = () => {
    setShowOverview(false);
  };

  return (
    <div className="dashboard-page analytics-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="dashboard-header">

        <div>

          <p className="dashboard-eyebrow">
            INSIGHTS
          </p>

          <h1>
            Analytics
          </h1>

          <p className="dashboard-subtitle">
            Understand your practice performance and growth.
          </p>

        </div>

        <div className="header-actions">

          <button
            className="new-button"
            type="button"
            onClick={handleOpenOverview}
          >
            Practice Overview
          </button>

        </div>

      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <section className="stats-grid">

        {/* TOTAL CLIENTS */}

        <div className="stat-card analytics-summary-card">

          <div className="stat-icon">
            <Users size={21} />
          </div>

          <div className="analytics-summary-content">

            <span>
              Total clients
            </span>

            <strong>
              {loading
                ? "—"
                : formatNumber(totalClients)}
            </strong>

            <small>
              All clients in your practice
            </small>

          </div>

        </div>

        {/* TOTAL BOOKINGS */}

        <div className="stat-card analytics-summary-card">

          <div className="stat-icon">
            <Calendar size={21} />
          </div>

          <div className="analytics-summary-content">

            <span>
              Total bookings
            </span>

            <strong>
              {loading
                ? "—"
                : formatNumber(totalBookings)}
            </strong>

            <small>
              All scheduled bookings
            </small>

          </div>

        </div>

        {/* REVENUE */}

        <div className="stat-card analytics-summary-card">

          <div className="stat-icon">
            <IndianRupee size={21} />
          </div>

          <div className="analytics-summary-content">

            <span>
              Total revenue
            </span>

            <strong>
              {loading
                ? "—"
                : formatCurrency(totalRevenue)}
            </strong>

            <small>
              Paid payments only
            </small>

          </div>

        </div>

        {/* COMPLETION RATE */}

        <div className="stat-card analytics-summary-card">

          <div className="stat-icon">
            <TrendingUp size={21} />
          </div>

          <div className="analytics-summary-content">

            <span>
              Completion rate
            </span>

            <strong>
              {loading
                ? "—"
                : `${completionRate.toFixed(1)}%`}
            </strong>

            <small>
              Completed bookings
            </small>

          </div>

        </div>

      </section>

      {/* =====================================================
          ANALYTICS CONTENT
      ===================================================== */}

      <div className="analytics-grid">

        {/* ===================================================
            PRACTICE OVERVIEW
        =================================================== */}

        <div className="dashboard-card">

          <div className="content-card-header">

            <div>

              <h2>
                Practice overview
              </h2>

              <p>
                Current booking and client metrics
              </p>

            </div>

          </div>

          <div className="analytics-list">

            {/* COMPLETED */}

            <div className="analytics-row">

              <div>

                <span>
                  Completed sessions
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        completedSessions
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <CheckCircle2 size={16} />

                {loading
                  ? "—"
                  : `${completionRate.toFixed(1)}%`}

              </div>

            </div>

            {/* TOTAL BOOKINGS */}

            <div className="analytics-row">

              <div>

                <span>
                  Total bookings
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        totalBookings
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <Calendar size={16} />

                {loading
                  ? "—"
                  : "All bookings"}

              </div>

            </div>

            {/* CLIENTS */}

            <div className="analytics-row">

              <div>

                <span>
                  Total clients
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        totalClients
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <Users size={16} />

                {loading
                  ? "—"
                  : "Active practice"}

              </div>

            </div>

            {/* CANCELLED */}

            <div className="analytics-row">

              <div>

                <span>
                  Cancelled bookings
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        cancelledBookings
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <XCircle size={16} />

                {loading
                  ? "—"
                  : "Cancelled"}

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            SESSION PERFORMANCE
        =================================================== */}

        <div className="dashboard-card">

          <div className="content-card-header">

            <div>

              <h2>
                Session performance
              </h2>

              <p>
                Booking completion overview
              </p>

            </div>

          </div>

          <div className="analytics-list">

            {/* COMPLETED */}

            <div className="analytics-row">

              <div>

                <span>
                  Completed
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        completedSessions
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <CheckCircle2 size={16} />

                {loading
                  ? "—"
                  : `${completionRate.toFixed(1)}%`}

              </div>

            </div>

            {/* CANCELLED */}

            <div className="analytics-row">

              <div>

                <span>
                  Cancelled
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        cancelledBookings
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <XCircle size={16} />

                {loading
                  ? "—"
                  : "Bookings"}

              </div>

            </div>

            {/* OTHER BOOKINGS */}

            <div className="analytics-row">

              <div>

                <span>
                  Other bookings
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatNumber(
                        otherBookings
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <Calendar size={16} />

                {loading
                  ? "—"
                  : "Pending / other"}

              </div>

            </div>

            {/* REVENUE */}

            <div className="analytics-row">

              <div>

                <span>
                  Total paid revenue
                </span>

                <strong>
                  {loading
                    ? "—"
                    : formatCurrency(
                        totalRevenue
                      )}
                </strong>

              </div>

              <div className="analytics-growth">

                <IndianRupee size={16} />

                {loading
                  ? "—"
                  : "INR"}

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          PRACTICE OVERVIEW MODAL
      ===================================================== */}

      {showOverview && (

        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
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
              handleCloseOverview();
            }
          }}
        >

          <div
            style={{
              width: "100%",
              maxWidth: "720px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#ffffff",
              borderRadius: "20px",
              boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.22)",
              padding: "30px"
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "26px"
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
                  INSIGHTS
                </p>

                <h2
                  style={{
                    margin: 0,
                    fontSize: "26px",
                    color: "#123d4a"
                  }}
                >
                  Practice Overview
                </h2>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#71808a",
                    fontSize: "14px"
                  }}
                >
                  A quick overview of your current practice performance.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseOverview}
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

            {/* OVERVIEW METRICS */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "14px"
              }}
            >

              {/* CLIENTS */}

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e3eeec",
                  borderRadius: "14px",
                  background: "#f8fcfb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                  }}
                >

                  <Users
                    size={19}
                    color="#258f89"
                  />

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#71808a"
                    }}
                  >
                    Total clients
                  </span>

                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#123d4a"
                  }}
                >
                  {loading
                    ? "—"
                    : formatNumber(totalClients)}
                </strong>

              </div>

              {/* BOOKINGS */}

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e3eeec",
                  borderRadius: "14px",
                  background: "#f8fcfb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                  }}
                >

                  <Calendar
                    size={19}
                    color="#258f89"
                  />

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#71808a"
                    }}
                  >
                    Total bookings
                  </span>

                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#123d4a"
                  }}
                >
                  {loading
                    ? "—"
                    : formatNumber(totalBookings)}
                </strong>

              </div>

              {/* COMPLETED */}

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e3eeec",
                  borderRadius: "14px",
                  background: "#f8fcfb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                  }}
                >

                  <CheckCircle2
                    size={19}
                    color="#258f89"
                  />

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#71808a"
                    }}
                  >
                    Completed sessions
                  </span>

                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#123d4a"
                  }}
                >
                  {loading
                    ? "—"
                    : formatNumber(
                        completedSessions
                      )}
                </strong>

              </div>

              {/* CANCELLED */}

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e3eeec",
                  borderRadius: "14px",
                  background: "#f8fcfb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                  }}
                >

                  <XCircle
                    size={19}
                    color="#258f89"
                  />

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#71808a"
                    }}
                  >
                    Cancelled bookings
                  </span>

                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#123d4a"
                  }}
                >
                  {loading
                    ? "—"
                    : formatNumber(
                        cancelledBookings
                      )}
                </strong>

              </div>

              {/* REVENUE */}

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e3eeec",
                  borderRadius: "14px",
                  background: "#f8fcfb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                  }}
                >

                  <IndianRupee
                    size={19}
                    color="#258f89"
                  />

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#71808a"
                    }}
                  >
                    Total paid revenue
                  </span>

                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#123d4a"
                  }}
                >
                  {loading
                    ? "—"
                    : formatCurrency(
                        totalRevenue
                      )}
                </strong>

              </div>

              {/* COMPLETION RATE */}

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #e3eeec",
                  borderRadius: "14px",
                  background: "#f8fcfb"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "12px"
                  }}
                >

                  <TrendingUp
                    size={19}
                    color="#258f89"
                  />

                  <span
                    style={{
                      fontSize: "13px",
                      color: "#71808a"
                    }}
                  >
                    Completion rate
                  </span>

                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "28px",
                    color: "#123d4a"
                  }}
                >
                  {loading
                    ? "—"
                    : `${completionRate.toFixed(1)}%`}
                </strong>

              </div>

            </div>

            {/* OTHER BOOKINGS */}

            <div
              style={{
                marginTop: "14px",
                padding: "20px",
                border: "1px solid #e3eeec",
                borderRadius: "14px",
                background: "#ffffff"
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >

                <div>

                  <span
                    style={{
                      display: "block",
                      fontSize: "13px",
                      color: "#71808a",
                      marginBottom: "6px"
                    }}
                  >
                    Other / pending bookings
                  </span>

                  <strong
                    style={{
                      fontSize: "22px",
                      color: "#123d4a"
                    }}
                  >
                    {loading
                      ? "—"
                      : formatNumber(
                          otherBookings
                        )}
                  </strong>

                </div>

                <Calendar
                  size={22}
                  color="#258f89"
                />

              </div>

            </div>

            {/* CLOSE BUTTON */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px"
              }}
            >

              <button
                type="button"
                onClick={handleCloseOverview}
                style={{
                  border: "none",
                  background: "#258f89",
                  color: "#ffffff",
                  padding: "11px 20px",
                  borderRadius: "10px",
                  fontSize: "14px",
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

    </div>
  );
}

export default Analytics;