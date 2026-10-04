const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const {
  sendMessage,
  getClientMessages,
  markClientMessagesAsRead
} = require("../controllers/chatController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  sendMessage
);

router.get(
  "/client/:clientId",
  authMiddleware,
  getClientMessages
);

router.put(
  "/client/:clientId/read",
  authMiddleware,
  markClientMessagesAsRead
);

module.exports = router;