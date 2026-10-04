import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Users,
  IndianRupee,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  AlertCircle
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const { therapist } = useAuth();

  const [analytics, setAnalytics] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [analyticsResponse, bookingsResponse] =
        await Promise.all([
          api.get("/analytics/overview"),
          api.get("/bookings")
        ]);

      setAnalytics(
        analyticsResponse.data?.analytics || null
      );

      const bookingData =
        bookingsResponse.data;

      setBookings(
        Array.isArray(bookingData)
          ? bookingData
          : Array.isArray(bookingData?.bookings)
            ? bookingData.bookings
            : []
      );
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const today = new Date();

  const todayKey = today.toLocaleDateString(
    "en-CA"
  );

  const todayBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!booking.startTime) {
          return false;
        }

        const bookingDate =
          new Date(
            booking.startTime
          ).toLocaleDateString("en-CA");

        return bookingDate === todayKey;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime) -
          new Date(b.startTime)
      );
  }, [bookings, todayKey]);

  const upcomingBookings = useMemo(() => {
    return bookings
      .filter((booking) => {
        if (!booking.startTime) {
          return false;
        }

        return (
          new Date(booking.startTime) >=
          new Date()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.startTime) -
          new Date(b.startTime)
      )
      .slice(0, 5);
  }, [bookings]);

  const completionRate = useMemo(() => {
    if (!analytics?.totalBookings) {
      return 0;
    }

    return Math.round(
      (analytics.completedSessions /
        analytics.totalBookings) *
        100
    );
  }, [analytics]);

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

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );
  };

  const getStatusClass = (status) => {
    if (status === "confirmed") {
      return "status-confirmed";
    }

    if (status === "completed") {
      return "status-completed";
    }

    if (status === "cancelled") {
      return "status-cancelled";
    }

    return "status-pending";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  const firstName =
    therapist?.name
      ?.split(" ")[0] || "there";

  const stats = [
    {
      title: "Total Clients",
      value:
        analytics?.totalClients ?? "—",
      description: "Active client records",
      icon: Users
    },
    {
      title: "Today's Sessions",
      value: todayBookings.length,
      description:
        todayBookings.length === 1
          ? "Session scheduled today"
          : "Sessions scheduled today",
      icon: CalendarDays
    },
    {
      title: "Total Revenue",
      value: `₹${Number(
        analytics?.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      description: "Paid payments",
      icon: IndianRupee
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      description:
        `${analytics?.completedSessions || 0} completed sessions`,
      icon: CheckCircle2
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="dashboard-loading">
          <RefreshCw
            size={22}
            className="loading-icon"
          />
          <span>
            Loading your practice overview...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">

      {/* HEADER */}
      <header className="dashboard-page-header">
        <div>
          <span className="dashboard-eyebrow">
            PRACTICE OVERVIEW
          </span>

          <h1>
            Good day, {firstName}
          </h1>

          <p>
            Here's what's happening with your
            practice today.
          </p>
        </div>

        <button
          type="button"
          className="dashboard-refresh-button"
          onClick={loadDashboard}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </header>


      {/* ERROR */}
      {error && (
        <div className="dashboard-error">
          <AlertCircle size={18} />

          <span>{error}</span>

          <button
            type="button"
            onClick={loadDashboard}
          >
            Try again
          </button>
        </div>
      )}


      {/* STATS */}
      <section className="dashboard-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              className="dashboard-stat-card"
              key={stat.title}
            >
              <div className="dashboard-stat-top">
                <div className="dashboard-stat-icon">
                  <Icon size={19} />
                </div>

                <ArrowUpRight
                  size={17}
                  className="dashboard-stat-arrow"
                />
              </div>

              <span className="dashboard-stat-title">
                {stat.title}
              </span>

              <strong className="dashboard-stat-value">
                {stat.value}
              </strong>

              <span className="dashboard-stat-description">
                {stat.description}
              </span>
            </div>
          );
        })}
      </section>


      {/* MAIN GRID */}
      <section className="dashboard-main-grid">

        {/* TODAY'S APPOINTMENTS */}
        <div className="dashboard-panel appointments-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="panel-eyebrow">
                SCHEDULE
              </span>

              <h2>
                Today's appointments
              </h2>

              <p>
                {today.toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  }
                )}
              </p>
            </div>

            <span className="appointment-count">
              {todayBookings.length}
            </span>
          </div>

          {todayBookings.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon">
                <CalendarDays size={22} />
              </div>

              <h3>
                No appointments today
              </h3>

              <p>
                Your schedule is clear for today.
              </p>
            </div>
          ) : (
            <div className="dashboard-appointments-list">
              {todayBookings.map((booking) => (
                <div
                  className="dashboard-appointment"
                  key={booking._id}
                >
                  <div className="appointment-time-block">
                    <Clock3 size={16} />
                    <strong>
                      {formatTime(
                        booking.startTime
                      )}
                    </strong>
                  </div>

                  <div className="dashboard-client-avatar">
                    {booking.clientName
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="dashboard-appointment-info">
                    <strong>
                      {booking.clientName ||
                        "Client"}
                    </strong>

                    <span>
                      {booking.durationMinutes ||
                        0}{" "}
                      minute session
                    </span>

                    <small>
                      {booking.clientEmail}
                    </small>
                  </div>

                  <span
                    className={`dashboard-status ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {getStatusLabel(
                      booking.status
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* PRACTICE SNAPSHOT */}
        <div className="dashboard-panel snapshot-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="panel-eyebrow">
                PRACTICE
              </span>

              <h2>
                Practice snapshot
              </h2>

              <p>
                Your current practice activity
              </p>
            </div>
          </div>

          <div className="snapshot-list">

            <div className="snapshot-item">
              <div className="snapshot-icon">
                <Users size={18} />
              </div>

              <div>
                <span>
                  Total clients
                </span>

                <strong>
                  {analytics?.totalClients ??
                    0}
                </strong>
              </div>
            </div>


            <div className="snapshot-item">
              <div className="snapshot-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>
                  Total bookings
                </span>

                <strong>
                  {analytics?.totalBookings ??
                    0}
                </strong>
              </div>
            </div>


            <div className="snapshot-item">
              <div className="snapshot-icon">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <span>
                  Completed sessions
                </span>

                <strong>
                  {analytics?.completedSessions ??
                    0}
                </strong>
              </div>
            </div>


            <div className="snapshot-item">
              <div className="snapshot-icon">
                <IndianRupee size={18} />
              </div>

              <div>
                <span>
                  Paid revenue
                </span>

                <strong>
                  ₹
                  {Number(
                    analytics?.totalRevenue ||
                      0
                  ).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

          </div>

          <div className="snapshot-footer">
            <span>
              Subscription
            </span>

            <strong>
              Professional Plan
            </strong>
          </div>
        </div>

      </section>


      {/* UPCOMING + ACTIVITY */}
      <section className="dashboard-bottom-grid">

        {/* UPCOMING */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="panel-eyebrow">
                NEXT SESSIONS
              </span>

              <h2>
                Upcoming appointments
              </h2>

              <p>
                Your next scheduled sessions
              </p>
            </div>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="dashboard-empty compact">
              <div className="empty-icon">
                <Clock3 size={20} />
              </div>

              <p>
                No upcoming appointments.
              </p>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingBookings.map(
                (booking) => (
                  <div
                    className="upcoming-row"
                    key={booking._id}
                  >
                    <div className="upcoming-date">
                      <strong>
                        {formatDate(
                          booking.startTime
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          booking.startTime
                        )}
                      </span>
                    </div>

                    <div className="upcoming-client">
                      <div className="dashboard-client-avatar small">
                        {booking.clientName
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "C"}
                      </div>

                      <div>
                        <strong>
                          {booking.clientName ||
                            "Client"}
                        </strong>

                        <span>
                          {
                            booking.durationMinutes
                          }{" "}
                          min session
                        </span>
                      </div>
                    </div>

                    <span
                      className={`dashboard-status ${getStatusClass(
                        booking.status
                      )}`}
                    >
                      {getStatusLabel(
                        booking.status
                      )}
                    </span>

                    <ChevronRight
                      size={17}
                      className="upcoming-arrow"
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>


        {/* WORKFLOW */}
        <div className="dashboard-panel workflow-panel">
          <div className="dashboard-panel-header">
            <div>
              <span className="panel-eyebrow">
                UNFAZED WORKFLOW
              </span>

              <h2>
                Practice at a glance
              </h2>

              <p>
                Keep your client journey organized.
              </p>
            </div>
          </div>

          <div className="workflow-steps">

            <div className="workflow-step">
              <span>01</span>

              <div>
                <strong>
                  Acquire
                </strong>

                <p>
                  Share your therapist profile
                  and booking link.
                </p>
              </div>
            </div>


            <div className="workflow-step">
              <span>02</span>

              <div>
                <strong>
                  Schedule
                </strong>

                <p>
                  Manage availability and
                  appointments.
                </p>
              </div>
            </div>


            <div className="workflow-step">
              <span>03</span>

              <div>
                <strong>
                  Manage
                </strong>

                <p>
                  Keep clients, notes,
                  payments and invoices together.
                </p>
              </div>
            </div>


            <div className="workflow-step">
              <span>04</span>

              <div>
                <strong>
                  Analyze
                </strong>

                <p>
                  Understand practice activity
                  through analytics.
                </p>
              </div>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;