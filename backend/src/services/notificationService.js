const Notification = require("../models/notificationModel");
const HttpMessage = require("../middlewares/HttpMessage");
const { getSocketIO } = require("../utils/socket");

class NotificationService {
  async createNotification(notificationData) {
    try {
      console.log("Creating notification:", notificationData);
      const notification = new Notification({
        ...notificationData,
        read: false,
      });

      await notification.save();

      const io = getSocketIO();
      io.to(notificationData.userId.toString()).emit(
        "notification",
        notification
      );

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async getNotificationsByUserId(userId) {
    try {
      console.log("Fetching notifications for user:", userId);
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
      return notifications;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async deleteNotification(notificationId) {
    try {
      console.log("Deleting notification:", notificationId);
      const notification = await Notification.findByIdAndDelete(
        notificationId
      ).exec();

      if (!notification) {
        throw HttpMessage.NOT_FOUND("Notification not found");
      }

      return notification;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async markAllNotificationsAsRead(userId) {
    try {
      console.log("Marking all notifications as read for user:", userId);
      const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
      ).exec();
      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async clearAllNotifications(userId) {
    try {
      console.log("Clearing all notifications for user:", userId);
      const result = await Notification.deleteMany({ userId }).exec();
      return result;
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }
}

module.exports = new NotificationService();
