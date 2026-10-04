const ChatMessage = require("../models/ChatMessage");
const Client = require("../models/Client");

const sendMessage = async (req, res) => {
  try {
    const { clientId, message } = req.body;

    if (!clientId || !message) {
      return res.status(400).json({
        success: false,
        message: "Client ID and message are required"
      });
    }

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

    const chatMessage = await ChatMessage.create({
      therapist: req.therapistId,
      client: client._id,
      sender: "therapist",
      message
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chatMessage
    });
  } catch (error) {
    console.error("Send chat message error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send message"
    });
  }
};

const getClientMessages = async (req, res) => {
  try {
    const { clientId } = req.params;

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

    const messages = await ChatMessage.find({
      therapist: req.therapistId,
      client: client._id
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    console.error("Get chat messages error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get chat messages"
    });
  }
};

const markClientMessagesAsRead = async (req, res) => {
  try {
    const { clientId } = req.params;

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

    await ChatMessage.updateMany(
      {
        therapist: req.therapistId,
        client: client._id,
        sender: "client",
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      message: "Client messages marked as read"
    });
  } catch (error) {
    console.error("Mark client messages as read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update chat messages"
    });
  }
};

module.exports = {
  sendMessage,
  getClientMessages,
  markClientMessagesAsRead
};
