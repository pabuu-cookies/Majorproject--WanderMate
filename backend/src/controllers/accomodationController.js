const accommodationService = require("../services/accommodationService");

class accommodationController {
  async getAccommodation(req, res, next) {
    const { place } = req.body;
    const concatPlace = place.split(" ").join("+");
    console.log(concatPlace);
    try {
      const result = await accommodationService.getAccommodation(concatPlace);
      res.locals.responseData = result;
      next();
    } catch (error) {
      console.log(error);
      const responseError = {
        statusCode: error.statusCode || 500,
        message: error.message || "An unexpected error occurred",
      };

      res.locals.responseData = { error: responseError };
      next();
    }
  }
}

module.exports = new accommodationController();
