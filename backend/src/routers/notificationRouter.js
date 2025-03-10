const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");
const handleResponse = require("../middlewares/handleResponse");
const isAuthenticated = require("../middlewares/isAuthenticated"); // Ensure user is authenticated

// Route to create a notification
router.post(
  "/create",
  isAuthenticated,
  NotificationController.createNotification,
  handleResponse
);

// Route to fetch all notifications for a user by userId
router.get(
  "/",
  isAuthenticated,
  NotificationController.getNotificationsByUserId,
  handleResponse
);

// Route to delete a specific notification
router.delete(
  "/clear/:notificationId",
  isAuthenticated,
  NotificationController.deleteNotification,
  handleResponse
);

router.put(
  "/markAll/read",
  isAuthenticated,
  NotificationController.markAllNotificationsAsRead,
  handleResponse
);

router.delete(
  "/clearAll",
  isAuthenticated,
  NotificationController.clearAllNotifications,
  handleResponse
);

module.exports = router;
