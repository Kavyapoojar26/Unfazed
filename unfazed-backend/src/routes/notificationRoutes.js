const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require("../controllers/notificationController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  createNotification
);

router.get(
  "/",
  authMiddleware,
  getNotifications
);

router.put(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsRead
);

router.put(
  "/:id/read",
  authMiddleware,
  markNotificationAsRead
);

router.delete(
  "/:id",
  authMiddleware,
  deleteNotification
);

module.exports = router;