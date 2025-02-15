const chatService = require("../services/chatService");

class ChatController {
  async saveChat(req, res, next) {
    const { messages } = req.body;
    const userId = req.userId;

    try {
      const result = await chatService.saveChat(userId, messages);
      res.locals.responseData = result;
      next();
    } catch (error) {
      console.error("Error saving chat:", error);
      res.locals.responseData = { error: error.message || "Server error" };
      next();
    }
  }

  // 🔹 Get Chat by Session ID
  async getChat(req, res, next) {
    const userId = req.userId;

    try {
      const chat = await chatService.getChats(userId);
      res.locals.responseData = chat;
      next();
    } catch (error) {
      console.error("Error retrieving chat:", error);
      res.locals.responseData = { error: error.message || "Server error" };
      next();
    }
  }
  async getLatestChat(req, res, next) {
    const userId = req.userId;

    try {
      const chat = await chatService.getLatestChat(userId);
      res.locals.responseData = chat;
      next();
    } catch (error) {
      console.error("Error retrieving chat:", error);
      res.locals.responseData = { error: error.message || "Server error" };
      next();
    }
  }

  // 🔹 Delete Chat Session
  async deleteChat(req, res, next) {
    const { chatId } = req.params;
    const userId = req.userId;

    try {
      await chatService.deleteChat(chatId, userId);
      res.locals.responseData = { message: "Chat deleted successfully" };
      next();
    } catch (error) {
      console.error("Error deleting chat:", error);
      res.locals.responseData = { error: error.message || "Server error" };
      next();
    }
  }

  // 🔹 Update a Chat Session (Add More Messages)
  async updateChat(req, res, next) {
    const { chatId } = req.params;
    const { messages } = req.body;
    const userId = req.userId;

    try {
      const updatedChat = await chatService.updateChat(
        chatId,
        messages,
        userId
      );
      res.locals.responseData = updatedChat;
      next();
    } catch (error) {
      console.error("Error updating chat:", error);
      res.locals.responseData = { error: error.message || "Server error" };
      next();
    }
  }
}

module.exports = new ChatController();
