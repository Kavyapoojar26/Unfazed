const ClinicalNote = require("../models/ClinicalNote");
const Client = require("../models/Client");
const Booking = require("../models/Booking");

const createClinicalNote = async (req, res) => {
  try {
    const {
      clientId,
      bookingId,
      noteType,
      title,
      content,
      visibility
    } = req.body;

    if (!clientId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Client, title and content are required"
      });
    }

    // Verify that the client belongs to the logged-in therapist.
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

    // Booking is optional, but if provided it must belong
    // to the same therapist and client.
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        therapist: req.therapistId,
        clientEmail: client.email
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found for this client"
        });
      }
    }

    const clinicalNote = await ClinicalNote.create({
      therapist: req.therapistId,
      client: clientId,
      booking: bookingId || null,
      noteType: noteType || "session",
      title,
      content,
      visibility: visibility || "private"
    });

    res.status(201).json({
      success: true,
      message: "Clinical note created successfully",
      clinicalNote
    });
  } catch (error) {
    console.error("Create clinical note error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getClinicalNotes = async (req, res) => {
  try {
    const { clientId, noteType, visibility } = req.query;

    const query = {
      therapist: req.therapistId
    };

    if (clientId) {
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

  query.client = client._id;
}

    if (noteType) {
      query.noteType = noteType;
    }

    if (visibility) {
      query.visibility = visibility;
    }

    const clinicalNotes = await ClinicalNote.find(query)
      .populate("client", "name email")
      .populate("booking", "startTime endTime status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: clinicalNotes.length,
      clinicalNotes
    });
  } catch (error) {
    console.error("Get clinical notes error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const getClinicalNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    const clinicalNote = await ClinicalNote.findOne({
      _id: id,
      therapist: req.therapistId
    })
      .populate("client", "name email")
      .populate("booking", "startTime endTime status");

    if (!clinicalNote) {
      return res.status(404).json({
        success: false,
        message: "Clinical note not found"
      });
    }

    res.json({
      success: true,
      clinicalNote
    });
  } catch (error) {
    console.error("Get clinical note error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const updateClinicalNote = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "noteType",
      "title",
      "content",
      "visibility"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update"
      });
    }

    const clinicalNote = await ClinicalNote.findOneAndUpdate(
      {
        _id: id,
        therapist: req.therapistId
      },
      updates,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("client", "name email")
      .populate("booking", "startTime endTime status");

    if (!clinicalNote) {
      return res.status(404).json({
        success: false,
        message: "Clinical note not found"
      });
    }

    res.json({
      success: true,
      message: "Clinical note updated successfully",
      clinicalNote
    });
  } catch (error) {
    console.error("Update clinical note error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

const deleteClinicalNote = async (req, res) => {
  try {
    const { id } = req.params;

    const clinicalNote = await ClinicalNote.findOneAndDelete({
      _id: id,
      therapist: req.therapistId
    });

    if (!clinicalNote) {
      return res.status(404).json({
        success: false,
        message: "Clinical note not found"
      });
    }

    res.json({
      success: true,
      message: "Clinical note deleted successfully"
    });
  } catch (error) {
    console.error("Delete clinical note error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createClinicalNote,
  getClinicalNotes,
  getClinicalNoteById,
  updateClinicalNote,
  deleteClinicalNote
};