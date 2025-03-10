const { httpMessages } = require("../middlewares/HttpMessage");

const isAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (req.role !== requiredRole) {
      return next(
        httpMessages.FORBIDDEN(`Access to this resource by ${req.role}`)
      );
    }
    next();
  };
};

module.exports = isAuthorized;
