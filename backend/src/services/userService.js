const User = require("../models/userModel");
const HttpMessage = require("../middlewares/HttpMessage");
const bcrypt = require("bcrypt");
const TokenUtils = require("../utils/token");

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
}

module.exports = new UserService();
