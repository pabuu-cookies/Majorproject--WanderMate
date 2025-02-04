const botService = require("../services/botService");

class rasaController {
  async sendMessage(req, res, next) {
    try {
      const message = req.body.message;
      console.log(message);
      const results = await botService.sendMessage(message);
      res.locals.responseData = results;
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
  async getSuggestions(req, res, next) {
    const { location } = req.params;

    try {
      const result = await botService.getSuggestions(location);
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

  async translate(req, res, next) {
    const { translatefrom, text, translateTo } = req.body;
    try {
      const result = await botService.translate(
        translatefrom,
        text,
        translateTo
      );
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

module.exports = new rasaController();
