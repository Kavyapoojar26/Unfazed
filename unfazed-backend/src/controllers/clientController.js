const Client = require("../models/Client");

const createClient = async (req, res) => {
  try {
    const { name, email, phone, tags } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required"
      });
    }

    const existingClient = await Client.findOne({
      therapist: req.therapistId,
      email: email.toLowerCase()
    });

    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "Client with this email already exists"
      });
    }

    const client = await Client.create({
      therapist: req.therapistId,
      name,
      email,
      phone: phone || "",
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: "Client created successfully",
      client
    });
  } catch (error) {
    console.error("Create client error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getClients = async (req, res) => {
  try {
    const { search, status, tag } = req.query;

    const query = {
      therapist: req.therapistId
    };

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i"
          }
        },
        {
          email: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    const clients = await Client.find(query).sort({
      createdAt: -1
    });

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (error) {
    console.error("Get clients error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    res.json({
      success: true,
      client
    });
  } catch (error) {
    console.error("Get client error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      status,
      tags,
      intakeCompleted,
      consentGiven
    } = req.body;

    const client = await Client.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    if (name !== undefined) {
      client.name = name.trim();
    }

    if (email !== undefined) {
      client.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) {
      client.phone = phone.trim();
    }

    if (status !== undefined) {
      client.status = status;
    }

    if (tags !== undefined) {
      client.tags = tags;
    }

    if (intakeCompleted !== undefined) {
      client.intakeCompleted = intakeCompleted;
    }

    if (consentGiven !== undefined) {
      client.consentGiven = consentGiven;
    }

    await client.save();

    res.json({
      success: true,
      message: "Client updated successfully",
      client
    });
  } catch (error) {
    console.error("Update client error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const updateClientIntake = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      intakeCompleted,
      consentGiven
    } = req.body;

    const client = await Client.findOne({
      _id: id,
      therapist: req.therapistId
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    if (intakeCompleted !== undefined) {
      client.intakeCompleted = intakeCompleted;
    }

    if (consentGiven !== undefined) {
      client.consentGiven = consentGiven;
    }

    await client.save();

    res.json({
      success: true,
      message: "Client intake updated successfully",
      client: {
        id: client._id,
        name: client.name,
        intakeCompleted: client.intakeCompleted,
        consentGiven: client.consentGiven
      }
    });
  } catch (error) {
    console.error("Update client intake error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  createClient,
  getClients,
  getClientById,
  updateClient,
  updateClientIntake
};