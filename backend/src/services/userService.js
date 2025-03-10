const User = require("../models/userModel");
const HireRequest = require("../models/hireRequest");
const HttpMessage = require("../middlewares/HttpMessage");
const bcrypt = require("bcrypt");
const TokenUtils = require("../utils/token");
const NotificationService = require("./notificationService");

class UserService {
  async registerUser(name, email, password, role) {
    try {
      console.log(email, name, password, role);
      const user = await User.findOne({ email });
      if (user) {
        throw HttpMessage.ALREADY_PRESENT;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        role,
        password: hashedPassword,
      });
      await newUser.save();
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      console.log("password", password);
      const user = await User.findOne({ email });
      if (!user) {
        throw HttpMessage.NOT_FOUND;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw HttpMessage.INVALID_CREDENTIALS;
      }

      const token = TokenUtils.generateToken({
        email: user.email,
        userId: user._id,
        role: user.role,
      });

      return { user, token };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update the profile of a guide.
   *
   * @param {string} userId - The ID of the user to update.
   * @param {Object} profileData - The data to update the guide's profile.
   * @returns {Object} - The updated guide profile.
   */
  async updateGuideProfile(userId, profileData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw HttpMessage.NOT_FOUND;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: profileData },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async getAllGuides() {
    const guides = await User.find({ role: "guide" });
    return guides;
  }

  async hireGuide(userId, guideId) {
    try {
      const user = await User.findById(userId);
      const guide = await User.findById(guideId);

      if (!user || !guide) {
        console.log("Either user or guide is not found");
        throw HttpMessage.NOT_FOUND;
      }
      const message = `${user.name} has requested to hire you.`;

      const notificationData = {
        userId: guideId, // The guide should receive the notification
        message,
        type: "info",
      };
      const hireRequest = new HireRequest({
        client: userId, // User who is requesting the hire
        guide: guideId, // Guide who is being hired
        status: "pending", // Default status as pending
        hireDate: new Date(), // Set the current date as hire date (you can change this logic)
      });

      // Save the hire request
      await hireRequest.save();
      // Call the createNotification service
      await NotificationService.createNotification(notificationData);

      console.log("Notification sent to guide:", guideId);
      return {
        success: true,
        message: "Guide hire request and notification sent.",
      };
    } catch (error) {
      console.error("Error hiring guide:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }

  async acceptGuideRequest(userId, guideId) {
    try {
      const user = await User.findById(userId);
      const guide = await User.findById(guideId);

      if (!user || !guide) {
        console.log("Either user or guide is not found");
        throw HttpMessage.NOT_FOUND;
      }
      const message = `${guide.name} has accepted Your Request to guide.`;

      const notificationData = {
        userId: userId, // The guide should receive the notification
        message,
        type: "info",
      };

      // Call the createNotification service
      await NotificationService.createNotification(notificationData);

      console.log("Notification sent to guide:", guideId);
      return { success: true, message: "Guide hired and notification sent." };
    } catch (error) {
      console.error("Error hiring guide:", error);
      throw HttpMessage.INTERNAL_SERVER_ERROR;
    }
  }
}

module.exports = new UserService();
