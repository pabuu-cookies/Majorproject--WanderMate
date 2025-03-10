const { httpMessages } = require("../middlewares/HttpMessage");

/**
 * Middleware to parse specified request body fields from JSON strings into objects.
 * If a field is a string and contains valid JSON, it will be parsed.
 * If JSON parsing fails, it responds with a `400 Bad Request` error.
 *
 * @param {string[]} fields - Array of field names in `req.body` that should be parsed as JSON.
 * @returns {Function} Express middleware function.
 */
const parseJsonFields = (fields) => (req, res, next) => {
  try {
    fields.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        try {
          req.body[field] = JSON.parse(req.body[field]);
        } catch (jsonError) {
          throw new Error(`Invalid JSON format in field: ${field}`);
        }
      }
    });

    next();
  } catch (error) {
    next(
      httpMessages.BAD_REQUEST(
        `Invalid JSON format in one of the fields: ${fields.join(", ")}`
      )
    );
  }
};

module.exports = parseJsonFields;
