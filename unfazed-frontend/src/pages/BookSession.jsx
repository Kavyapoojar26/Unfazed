import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "./BookSession.css";

const BookSession = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [selectedSlot, setSelectedSlot] = useState("");

  const [step, setStep] = useState("schedule");

  const [clientDetails, setClientDetails] = useState({
    name: "",
    email: "",
    phone: "",
    reason: ""
  });

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        const response = await api.get(
          `/availability/public/${slug}`
        );

        setAvailability(
          response.data.availability
        );
      } catch (err) {
        console.error(
          "Availability error:",
          err
        );

        setError(
          "Unable to load therapist availability."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
  }, [slug]);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const selectedDayOfWeek = useMemo(() => {
    if (!selectedDate) return null;

    // Use local browser date to determine weekday.
    const [year, month, day] =
      selectedDate.split("-").map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return date.getDay();
  }, [selectedDate]);

  const selectedSchedule = useMemo(() => {
    if (
      !availability ||
      selectedDayOfWeek === null
    ) {
      return null;
    }

    return availability.weeklySchedule.find(
      (item) =>
        item.dayOfWeek ===
          selectedDayOfWeek &&
        item.enabled
    );
  }, [
    availability,
    selectedDayOfWeek
  ]);

  const slots = useMemo(() => {
    if (!selectedSchedule) return [];

    const duration =
      Number(selectedDuration);

    const buffer =
      Number(
        availability?.bufferMinutes || 0
      );

    const [startHour, startMinute] =
      selectedSchedule.startTime
        .split(":")
        .map(Number);

    const [endHour, endMinute] =
      selectedSchedule.endTime
        .split(":")
        .map(Number);

    let currentMinutes =
      startHour * 60 + startMinute;

    const endMinutes =
      endHour * 60 + endMinute;

    const generatedSlots = [];

    while (
      currentMinutes + duration <=
      endMinutes
    ) {
      const hour = Math.floor(
        currentMinutes / 60
      );

      const minute =
        currentMinutes % 60;

      const value =
        `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;

      const displayHour =
        hour % 12 || 12;

      const period =
        hour >= 12 ? "PM" : "AM";

      const label =
        `${displayHour}:${String(
          minute
        ).padStart(2, "0")} ${period}`;

      generatedSlots.push({
        value,
        label
      });

      currentMinutes +=
        duration + buffer;
    }

    return generatedSlots;
  }, [
    availability,
    selectedDuration,
    selectedSchedule
  ]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setSelectedSlot("");
    setError("");
  };

  const handleContinue = () => {
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }

    if (!selectedSchedule) {
      setError(
        "The therapist is not available on this day."
      );
      return;
    }

    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }

    setError("");
    setStep("details");
  };

  const handleDetailsChange = (event) => {
    const { name, value } = event.target;

    setClientDetails((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const handleConfirmBooking = async (
    event
  ) => {
    event.preventDefault();

    if (
      !clientDetails.name.trim() ||
      !clientDetails.email.trim()
    ) {
      setError(
        "Please enter your name and email address."
      );
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError(
        "Please select your date and time."
      );
      return;
    }

    setBookingLoading(true);
    setError("");
    setSuccess("");

    try {
     const [year, month, day] = selectedDate
  .split("-")
  .map(Number);

const [hour, minute] = selectedSlot
  .split(":")
  .map(Number);

const startDateTime = new Date(
  year,
  month - 1,
  day,
  hour,
  minute,
  0,
  0
);
      const response = await api.post(
        `/bookings/public/${slug}`,
        {
          clientName:
            clientDetails.name.trim(),

          clientEmail:
            clientDetails.email.trim(),

          startTime:
            startDateTime.toISOString(),

          durationMinutes:
            Number(selectedDuration),

          clientTimezone:
            Intl.DateTimeFormat().resolvedOptions()
              .timeZone
        }
      );

      if (response.data.success) {
        setSuccess(
          "Your session has been booked successfully."
        );

        setStep("success");
      }
    } catch (err) {
      console.error(
        "Booking error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Unable to create booking. Please try again.";

      setError(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <p>Loading availability...</p>
        </div>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <h2>Booking unavailable</h2>
          <p>
            This therapist has not configured
            availability yet.
          </p>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="booking-page">
        <div className="booking-card success-card">
          <div className="success-icon">
            ✓
          </div>

          <h1>Booking confirmed</h1>

          <p>
            Your session has been successfully
            booked.
          </p>

          <div className="booking-summary">
            <p>
              <strong>Date:</strong>{" "}
              {selectedDate}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {selectedSlot}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {selectedDuration} minutes
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {clientDetails.email}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/therapist/${slug}`
              )
            }
          >
            Back to therapist profile
          </button>
        </div>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="booking-page">
        <div className="booking-card">
          <button
            type="button"
            onClick={() => {
              setStep("schedule");
              setError("");
            }}
          >
            ← Back
          </button>

          <h1>Your details</h1>

          <p>
            Please provide your details to
            confirm the session.
          </p>

          {error && (
            <div className="booking-error">
              {error}
            </div>
          )}

          <form
            onSubmit={handleConfirmBooking}
          >
            <label>
              Full name
              <input
                type="text"
                name="name"
                value={clientDetails.name}
                onChange={handleDetailsChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                name="email"
                value={clientDetails.email}
                onChange={handleDetailsChange}
                placeholder="Enter your email"
                required
              />
            </label>

            <label>
              Phone number
              <input
                type="tel"
                name="phone"
                value={clientDetails.phone}
                onChange={handleDetailsChange}
                placeholder="Enter your phone number"
              />
            </label>

            <label>
              What would you like support with?
              <textarea
                name="reason"
                value={clientDetails.reason}
                onChange={handleDetailsChange}
                placeholder="Optional"
                rows="4"
              />
            </label>

            <div className="booking-summary">
              <h3>Session summary</h3>

              <p>
                <strong>Date:</strong>{" "}
                {selectedDate}
              </p>

              <p>
                <strong>Time:</strong>{" "}
                {selectedSlot}
              </p>

              <p>
                <strong>Duration:</strong>{" "}
                {selectedDuration} minutes
              </p>

              <p>
                🔒 Your information is
                handled securely.
              </p>
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
            >
              {bookingLoading
                ? "Confirming..."
                : "Confirm details"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-card">
        <h1>Book a session</h1>

        <p>
          Choose a date, session duration and
          available time.
        </p>

        {error && (
          <div className="booking-error">
            {error}
          </div>
        )}

        {success && (
          <div className="booking-success">
            {success}
          </div>
        )}

        <label>
          Date
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={handleDateChange}
          />
        </label>

        {selectedDate &&
          !selectedSchedule && (
            <p>
              No availability on this date.
            </p>
          )}

        <label>
          Session duration
          <select
            value={selectedDuration}
            onChange={(event) => {
              setSelectedDuration(
                Number(event.target.value)
              );
              setSelectedSlot("");
            }}
          >
            {availability.sessionDurations.map(
              (duration) => (
                <option
                  key={duration}
                  value={duration}
                >
                  {duration} minutes
                </option>
              )
            )}
          </select>
        </label>

        {selectedSchedule && (
          <>
            <h3>Available times</h3>

            <div className="slot-grid">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <button
                    type="button"
                    key={slot.value}
                    onClick={() => {
                      setSelectedSlot(
                        slot.value
                      );
                      setError("");
                    }}
                    className={
                      selectedSlot ===
                      slot.value
                        ? "selected"
                        : ""
                    }
                  >
                    {slot.label}
                  </button>
                ))
              ) : (
                <p>
                  No slots available for this
                  duration.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleContinue}
            >
              Continue
            </button>
          </>
        )}

        <p>
          🔒 Your booking information is
          handled securely.
        </p>
      </div>
    </div>
  );
};

export default BookSession;