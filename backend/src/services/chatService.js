const Chat = require("../models/chatModel");
const HttpMessage = require("../middlewares/HttpMessage"); // Importing HttpMessage

class ChatService {
  // Save Chat
  async saveChat(userId, messages) {
    try {
      const chat = new Chat({ userId, messages });
      await chat.save();
      return chat;
    } catch (error) {
      console.log("Error saving chat:", error.message); // Log error
      throw HttpMessage.INTERNAL_SERVER_ERROR; // Custom error
    }
  }

  // Get All Chats by User
  async getChats(userId) {
    try {
      const chats = await Chat.find({ userId }).sort({
        createdAt: -1,
        updatedAt: -1,
      });
      if (!chats) {
        console.log("Chats not found for user:", userId);
        throw HttpMessage.NOT_FOUND;
      }
      return chats;
    } catch (error) {
      console.log("Error fetching chats:", error.message);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async getLatestChat(userId) {
    try {
      const chat = await Chat.findOne({ userId }).sort({ createdAt: -1 });
      if (!chat) {
        console.log("Latest chat not found for user:", userId);
        throw HttpMessage.NOT_FOUND;
      }
      return chat;
    } catch (error) {
      console.log("Error fetching latest chat:", error.message);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async deleteChat(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.log("Chat session not found:", chatId);
        throw HttpMessage.NOT_FOUND;
      }

      if (chat.userId.toString() !== userId) {
        console.log("User unauthorized to delete this chat:", userId);
        throw HttpMessage.FORBIDDEN;
      }

      await Chat.findByIdAndDelete(chatId);
      return { message: "Chat deleted successfully" };
    } catch (error) {
      console.log("Error deleting chat:", error.message);
      throw error;
    }
  }

  async updateChat(chatId, newMessages, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        console.log("Chat session not found:", chatId);
        throw HttpMessage.NOT_FOUND;
      }

      if (chat.userId.toString() !== userId) {
        console.log("User unauthorized to update this chat:", userId);
        throw HttpMessage.FORBIDDEN;
      }

      chat.messages.push(...newMessages);
      await chat.save();
      return chat;
    } catch (error) {
      console.log("Error updating chat:", error.message);
      throw error;
    }
  }
}

module.exports = new ChatService();
