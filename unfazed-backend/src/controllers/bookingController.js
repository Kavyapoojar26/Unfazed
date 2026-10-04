const Booking = require("../models/Booking");
const Availability = require("../models/Availability");
const Therapist = require("../models/Therapist");
const Client = require("../models/Client");

// ---------------------------------------------
// FIND OR CREATE CLIENT
// ---------------------------------------------

const findOrCreateClient = async ({
  therapistId,
  clientName,
  clientEmail,
  clientPhone
}) => {
  const normalizedEmail =
    clientEmail.trim().toLowerCase();

  let client = await Client.findOne({
    therapist: therapistId,
    email: normalizedEmail
  });

  if (client) {
    const updates = {};

    if (
      clientPhone &&
      clientPhone.trim() &&
      !client.phone
    ) {
      updates.phone = clientPhone.trim();
    }

    if (
      clientName &&
      clientName.trim() &&
      client.name !== clientName.trim()
    ) {
      updates.name = clientName.trim();
    }

    if (client.status === "archived") {
      updates.status = "active";
    }

    if (Object.keys(updates).length > 0) {
      client = await Client.findByIdAndUpdate(
        client._id,
        updates,
        {
          new: true
        }
      );
    }

    return client;
  }

  client = await Client.create({
    therapist: therapistId,
    name: clientName.trim(),
    email: normalizedEmail,
    phone: clientPhone
      ? clientPhone.trim()
      : "",
    status: "active"
  });

  return client;
};


// ---------------------------------------------
// CREATE BOOKING - AUTHENTICATED THERAPIST
// ---------------------------------------------

const createBooking = async (req, res) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      startTime,
      durationMinutes,
      clientTimezone
    } = req.body;

    if (
      !clientName ||
      !clientEmail ||
      !startTime ||
      !durationMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required booking details are missing"
      });
    }

    const availability =
      await Availability.findOne({
        therapist: req.therapistId
      });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message:
          "Therapist availability is not configured"
      });
    }

    const numericDuration =
      Number(durationMinutes);

    if (
      !availability.sessionDurations.includes(
        numericDuration
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session duration"
      });
    }

    const start = new Date(startTime);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time"
      });
    }

    const end = new Date(
      start.getTime() +
        numericDuration * 60 * 1000
    );

    const overlappingBooking =
      await Booking.findOne({
        therapist: req.therapistId,
        status: {
          $in: ["pending", "confirmed"]
        },
        startTime: {
          $lt: end
        },
        endTime: {
          $gt: start
        }
      });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked"
      });
    }

    // Find existing client or create a new one.
    const client = await findOrCreateClient({
      therapistId: req.therapistId,
      clientName,
      clientEmail,
      clientPhone
    });

    const booking = await Booking.create({
      therapist: req.therapistId,
      clientName: client.name,
      clientEmail: client.email,
      startTime: start,
      endTime: end,
      durationMinutes: numericDuration,
      clientTimezone:
        clientTimezone || "UTC",
      status: "confirmed"
    });

    res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking,
      client
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ---------------------------------------------
// CREATE BOOKING - PUBLIC CLIENT
// ---------------------------------------------

const createPublicBooking = async (
  req,
  res
) => {
  try {
    const { slug } = req.params;

    const {
      clientName,
      clientEmail,
      clientPhone,
      startTime,
      durationMinutes,
      clientTimezone
    } = req.body;

    if (
      !clientName ||
      !clientEmail ||
      !startTime ||
      !durationMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required booking details are missing"
      });
    }

    const therapist =
      await Therapist.findOne({
        slug
      }).select("_id name slug");

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message:
          "Therapist not found"
      });
    }

    const availability =
      await Availability.findOne({
        therapist: therapist._id
      });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message:
          "Therapist availability is not configured"
      });
    }

    const numericDuration =
      Number(durationMinutes);

    if (
      !availability.sessionDurations.includes(
        numericDuration
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid session duration"
      });
    }

    const start = new Date(startTime);

    if (Number.isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start time"
      });
    }

    const end = new Date(
      start.getTime() +
        numericDuration * 60 * 1000
    );

    // Verify selected weekday.
    const dayOfWeek = start.getDay();

    const schedule =
      availability.weeklySchedule.find(
        (item) =>
          item.dayOfWeek === dayOfWeek &&
          item.enabled
      );

    if (!schedule) {
      return res.status(400).json({
        success: false,
        message:
          "The therapist is not available on this day"
      });
    }

    // Convert selected time to minutes.
    const startMinutes =
      start.getHours() * 60 +
      start.getMinutes();

    const scheduleStartMinutes =
      Number(
        schedule.startTime.split(":")[0]
      ) *
        60 +
      Number(
        schedule.startTime.split(":")[1]
      );

    const scheduleEndMinutes =
      Number(
        schedule.endTime.split(":")[0]
      ) *
        60 +
      Number(
        schedule.endTime.split(":")[1]
      );

    const endMinutes =
      startMinutes + numericDuration;

    if (
      startMinutes <
        scheduleStartMinutes ||
      endMinutes >
        scheduleEndMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          "The selected time is outside the therapist's availability"
      });
    }

    // Check for overlapping bookings.
    const overlappingBooking =
      await Booking.findOne({
        therapist: therapist._id,
        status: {
          $in: ["pending", "confirmed"]
        },
        startTime: {
          $lt: end
        },
        endTime: {
          $gt: start
        }
      });

    if (overlappingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked"
      });
    }

    // Find existing client or create a new one.
    const client = await findOrCreateClient({
      therapistId: therapist._id,
      clientName,
      clientEmail,
      clientPhone
    });

    const booking = await Booking.create({
      therapist: therapist._id,
      clientName: client.name,
      clientEmail: client.email,
      startTime: start,
      endTime: end,
      durationMinutes: numericDuration,
      clientTimezone:
        clientTimezone || "Asia/Kolkata",
      status: "confirmed"
    });

    res.status(201).json({
      success: true,
      message:
        "Booking created successfully",
      booking,
      client
    });
  } catch (error) {
    console.error(
      "Create public booking error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to create booking"
    });
  }
};


// ---------------------------------------------
// GET THERAPIST BOOKINGS
// ---------------------------------------------

const getBookings = async (req, res) => {
  try {
    const bookings =
      await Booking.find({
        therapist: req.therapistId
      }).sort({
        startTime: 1
      });

    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error(
      "Get bookings error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createBooking,
  createPublicBooking,
  getBookings
};