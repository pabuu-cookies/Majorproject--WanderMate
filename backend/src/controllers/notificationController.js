const NotificationService = require("../services/notificationService");

class NotificationController {
  async createNotification(req, res, next) {
    const notificationData = req.body;
    try {
      console.log("Creating notification:", notificationData);
      const notification = await NotificationService.createNotification(
        notificationData
      );

      res.locals.responseData = notification;
      next();
    } catch (error) {
      console.log("Error creating notification:", error);
      res.locals.responseData = { error: error.message };
      next();
    }
  }

  async getNotificationsByUserId(req, res, next) {
    const userId = req.userId;
    try {
      console.log(`Fetching notifications for user: ${userId}`);
      const notifications = await NotificationService.getNotificationsByUserId(
        userId
      );

      res.locals.responseData = notifications;
      next();
    } catch (error) {
      console.log("Error fetching notifications:", error);
      res.locals.responseData = { error: error.message };
      next();
    }
  }

  async deleteNotification(req, res, next) {
    const notificationId = req.params.notificationId;
    try {
      console.log(`Deleting notification: ${notificationId}`);
      const deletedNotification = await NotificationService.deleteNotification(
        notificationId
      );

      res.locals.responseData = deletedNotification;
      next();
    } catch (error) {
      console.log("Error deleting notification:", error);
      res.locals.responseData = { error: error.message };
      next();
    }
  }

  async markAllNotificationsAsRead(req, res, next) {
    const userId = req.userId;
    try {
      console.log(`Marking all notifications as read for user: ${userId}`);
      const updatedNotifications =
        await NotificationService.markAllNotificationsAsRead(userId);

      res.locals.responseData = updatedNotifications;
      next();
    } catch (error) {
      console.log("Error marking all notifications as read:", error);
      res.locals.responseData = { error: error.message };
      next();
    }
  }

  async clearAllNotifications(req, res, next) {
    const userId = req.userId;
    try {
      console.log(`Clearing all notifications for user: ${userId}`);
      await NotificationService.clearAllNotifications(userId);

      res.locals.responseData = { message: "All notifications cleared" };
      next();
    } catch (error) {
      console.log("Error clearing notifications:", error);
      res.locals.responseData = { error: error.message };
      next();
    }
  }
}

module.exports = new NotificationController();
