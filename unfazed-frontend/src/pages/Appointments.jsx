import {
  useEffect,
  useMemo,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
  CalendarDays,
  Clock3,
  Plus,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Appointments() {
  const navigate = useNavigate();
  const { therapist } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* --------------------------------
     DATE KEY
  -------------------------------- */

  const dateKey = useMemo(() => {
    const year = selectedDate.getFullYear();

    const month = String(
      selectedDate.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      selectedDate.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, [selectedDate]);

  /* --------------------------------
     LOAD BOOKINGS
  -------------------------------- */

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/bookings"
        );

        const data = response.data;

        const bookingList =
          Array.isArray(data)
            ? data
            : Array.isArray(data.bookings)
              ? data.bookings
              : Array.isArray(data.data)
                ? data.data
                : [];

        setAppointments(bookingList);
      } catch (error) {
        console.error(
          "Failed to load appointments:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load appointments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  /* --------------------------------
     NEW APPOINTMENT
  -------------------------------- */

  const handleNewAppointment = () => {
    const therapistSlug =
      therapist?.slug ||
      therapist?.publicSlug;

    if (!therapistSlug) {
      setError(
        "Your therapist profile slug is not available."
      );
      return;
    }

    navigate(
      `/therapist/${therapistSlug}/book`
    );
  };

  /* --------------------------------
     DATE NAVIGATION
  -------------------------------- */

  const goToPreviousDay = () => {
    setSelectedDate((current) => {
      const next = new Date(current);

      next.setDate(
        next.getDate() - 1
      );

      return next;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((current) => {
      const next = new Date(current);

      next.setDate(
        next.getDate() + 1
      );

      return next;
    });
  };

  /* --------------------------------
     DATE FORMATTING
  -------------------------------- */

  const formatDate = (date) => {
    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    );
  };

  const formatTime = (value) => {
    if (!value) {
      return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const formatDuration = (booking) => {
    if (booking.duration) {
      return `${booking.duration} min`;
    }

    if (
      booking.durationMinutes
    ) {
      return `${booking.durationMinutes} min`;
    }

    if (
      booking.startTime &&
      booking.endTime
    ) {
      const start = new Date(
        booking.startTime
      );

      const end = new Date(
        booking.endTime
      );

      if (
        !Number.isNaN(
          start.getTime()
        ) &&
        !Number.isNaN(
          end.getTime()
        )
      ) {
        const minutes = Math.round(
          (end.getTime() -
            start.getTime()) /
            60000
        );

        if (minutes > 0) {
          return `${minutes} min`;
        }
      }
    }

    return "—";
  };

  /* --------------------------------
     BOOKING HELPERS
  -------------------------------- */

  const getClientName = (booking) => {
    if (booking.client?.name) {
      return booking.client.name;
    }

    if (booking.client?.fullName) {
      return booking.client.fullName;
    }

    if (booking.clientName) {
      return booking.clientName;
    }

    if (booking.name) {
      return booking.name;
    }

    return "Client";
  };

  const getAppointmentType = (
    booking
  ) => {
    return (
      booking.type ||
      booking.sessionType ||
      booking.appointmentType ||
      booking.service ||
      "Therapy Session"
    );
  };

  const getStatus = (booking) => {
    const status =
      booking.status || "pending";

    return (
      String(status)
        .charAt(0)
        .toUpperCase() +
      String(status)
        .slice(1)
        .toLowerCase()
    );
  };

  const getBookingDate = (booking) => {
    return (
      booking.startTime ||
      booking.startAt ||
      booking.scheduledAt ||
      booking.date
    );
  };

  /* --------------------------------
     FILTER SELECTED DAY
  -------------------------------- */

  const selectedDayAppointments =
    useMemo(() => {
      return appointments
        .filter((booking) => {
          const bookingDate =
            getBookingDate(booking);

          if (!bookingDate) {
            return false;
          }

          const date = new Date(
            bookingDate
          );

          if (
            Number.isNaN(
              date.getTime()
            )
          ) {
            return false;
          }

          const year =
            date.getFullYear();

          const month = String(
            date.getMonth() + 1
          ).padStart(2, "0");

          const day = String(
            date.getDate()
          ).padStart(2, "0");

          return (
            `${year}-${month}-${day}` ===
            dateKey
          );
        })
        .sort((a, b) => {
          const first = new Date(
            getBookingDate(a)
          ).getTime();

          const second = new Date(
            getBookingDate(b)
          ).getTime();

          return first - second;
        });
    }, [appointments, dateKey]);

  /* --------------------------------
     RENDER
  -------------------------------- */

  return (
    <div className="dashboard-page">

      {/* HEADER */}

      <header className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">
            SCHEDULE
          </p>

          <h1>
            Appointments
          </h1>

          <p className="dashboard-subtitle">
            Manage your upcoming sessions
            and schedule.
          </p>
        </div>

        <div className="header-actions">

          <button
            className="new-button"
            type="button"
            onClick={
              handleNewAppointment
            }
          >
            <Plus size={18} />
            New Appointment
          </button>

        </div>

      </header>

      {/* ERROR */}

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      {/* CALENDAR TOOLBAR */}

      <div className="appointments-toolbar">

        <div className="date-navigation">

          <button
            className="calendar-nav-button"
            onClick={
              goToPreviousDay
            }
            type="button"
            aria-label="Previous day"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="current-date">

            <CalendarDays size={18} />

            <strong>
              {formatDate(
                selectedDate
              )}
            </strong>

          </div>

          <button
            className="calendar-nav-button"
            onClick={
              goToNextDay
            }
            type="button"
            aria-label="Next day"
          >
            <ChevronRight size={17} />
          </button>

        </div>

        <div className="calendar-view-buttons">

          <button
            className="calendar-view active"
            type="button"
          >
            Day
          </button>

          <button
            className="calendar-view"
            type="button"
          >
            Week
          </button>

          <button
            className="calendar-view"
            type="button"
          >
            Month
          </button>

        </div>

      </div>

      {/* APPOINTMENTS CARD */}

      <div className="dashboard-card appointments-page-card">

        <div className="appointments-page-header">

          <div>

            <h2>
              {selectedDate.toDateString() ===
              new Date().toDateString()
                ? "Today's schedule"
                : "Daily schedule"}
            </h2>

            <p>
              {loading
                ? "Loading appointments..."
                : `${selectedDayAppointments.length} ${
                    selectedDayAppointments.length ===
                    1
                      ? "appointment"
                      : "appointments"
                  } scheduled`}
            </p>

          </div>

        </div>

        <div className="schedule-list">

          {/* LOADING */}

          {loading && (
            <div className="empty-state">
              Loading appointments...
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            selectedDayAppointments.length ===
              0 && (
              <div className="empty-state">
                No appointments scheduled
                for this day.
              </div>
            )}

          {/* REAL BOOKINGS */}

          {!loading &&
            selectedDayAppointments.length >
              0 &&
            selectedDayAppointments.map(
              (appointment) => {

                const clientName =
                  getClientName(
                    appointment
                  );

                const status =
                  getStatus(
                    appointment
                  );

                const bookingDate =
                  getBookingDate(
                    appointment
                  );

                return (
                  <div
                    className="schedule-row"
                    key={
                      appointment._id ||
                      appointment.id ||
                      `${clientName}-${bookingDate}`
                    }
                  >

                    {/* TIME */}

                    <div className="schedule-time">

                      <strong>
                        {formatTime(
                          bookingDate
                        )}
                      </strong>

                      <span>
                        {formatDuration(
                          appointment
                        )}
                      </span>

                    </div>

                    {/* TIMELINE */}

                    <div className="schedule-line">

                      <div className="schedule-dot"></div>

                    </div>

                    {/* CLIENT AVATAR */}

                    <div className="schedule-client-avatar">

                      {clientName
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    {/* CLIENT */}

                    <div className="schedule-client">

                      <strong>
                        {clientName}
                      </strong>

                      <span>
                        {getAppointmentType(
                          appointment
                        )}
                      </span>

                    </div>

                    {/* STATUS */}

                    <span
                      className={`appointment-status ${
                        status.toLowerCase() ===
                        "pending"
                          ? "pending"
                          : ""
                      }`}
                    >
                      {status}
                    </span>

                  </div>
                );
              }
            )}

        </div>

      </div>

      {/* AVAILABILITY */}

      <div className="dashboard-card availability-card">

        <div className="card-header">

          <div>

            <h2>
              Availability
            </h2>

            <p>
              Your available booking
              hours today
            </p>

          </div>

        </div>

        <div className="availability-content">

          <div className="availability-item">

            <Clock3 size={18} />

            <div>

              <strong>
                09:00 AM – 01:00 PM
              </strong>

              <span>
                Morning availability
              </span>

            </div>

          </div>

          <div className="availability-item">

            <Clock3 size={18} />

            <div>

              <strong>
                03:00 PM – 07:00 PM
              </strong>

              <span>
                Evening availability
              </span>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Appointments;