const User = require('../models/userModel');
const HttpMessage = require('../middlewares/HttpMessage');
const bcrypt = require('bcrypt');

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
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
