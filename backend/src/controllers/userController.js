const UserService = require("../services/userService");

class userController {
  async registerUser(req, res, next) {
    const { name, email, password, role } = req.body;
    try {
      console.log(role, "is the user");
      const results = await UserService.registerUser(
        name,
        email,
        password,
        role
      );

      res.locals.responseData = results;
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      next();
    }
  }

  async loginUser(req, res, next) {
    const { email, password } = req.body;
    try {
      const results = await UserService.loginUser(email, password);
      res.locals.responseData = results;
      console.log(results);
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }
  async getAllGuides(req, res, next) {
    try {
      const results = await UserService.getAllGuides();
      res.locals.responseData = results;
      console.log(results);
      next();
    } catch (error) {
      res.locals.responseData = { error: error };
      console.log(error);
      next();
    }
  }

  async updateGuideProfile(req, res, next) {
    const profileData = req.body;
    const userId = req.userId;
    console.log(profileData);

    try {
      const updatedProfile = await UserService.updateGuideProfile(
        userId,
        profileData
      );

      res.locals.responseData = updatedProfile;
      next();
    } catch (error) {
      res.locals.responseData = { error: error.message };
      next();
    }
  }
}

module.exports = new userController();
