const User = require("../models/userModel");
const HttpMessage = require("../middlewares/HttpMessage");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

class UserService {
  async registerUser(name, email, password) {
    try {
      console.log(email, name, password);
      const user = await User.findOne({ email });
      if (user) {
        throw HttpMessage.ALREADY_PRESENT;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
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
      const user = await User.findOne({ email });
      if (!user) {
        throw HttpMessage.NOT_FOUND;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw HttpMessage.INVALID_CREDENTIALS;
      }

      const token = jwt.sign(
        { email: user.email, userId: user._id, role: user.role },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      return { user, token };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
