const Notification = require("../models/Notification");
const Client = require("../models/Client");

const createNotification = async (req, res) => {
  try {
    const {
      clientId,
      type,
      title,
      message
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }

    let client = null;

    if (clientId) {
      client = await Client.findOne({
        _id: clientId,
        therapist: req.therapistId
      });

      if (!client) {
        return res.status(404).json({
          success: false,
          message: "Client not found"
        });
      }
    }

    const notification = await Notification.create({
      therapist: req.therapistId,
      client: client ? client._id : null,
      type: type || "general",
      title,
      message
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification
    });
  } catch (error) {
    console.error("Create notification error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create notification"
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    const filter = {
      therapist: req.therapistId
    };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .populate("client", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to get notifications"
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        therapist: req.therapistId
      },
      {
        isRead: true
      },
      {
        new: true
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update notification"
    });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        therapist: req.therapistId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update notifications"
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      therapist: req.therapistId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete notification"
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
};