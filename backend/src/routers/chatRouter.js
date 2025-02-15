const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
const authenticateToken = require("../middlewares/isAuthenticated"); // Assuming token auth middleware
const handleResponse = require("../middlewares/handleResponse"); // Assuming generic response handler

// Save a new chat
router.post("/", authenticateToken, chatController.saveChat, handleResponse);

// Get chat by userId
router.get("/", authenticateToken, chatController.getChat, handleResponse);

// Get the latest chat by userId
router.get(
  "/latest",
  authenticateToken,
  chatController.getLatestChat,
  handleResponse
);

// Delete chat by chatId
router.delete(
  "/:chatId",
  authenticateToken,
  chatController.deleteChat,
  handleResponse
);

router.patch(
  "/:chatId",
  authenticateToken,
  chatController.updateChat,
  handleResponse
);

module.exports = router;
