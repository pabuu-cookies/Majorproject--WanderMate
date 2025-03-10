const { httpMessages } = require("../middlewares");

const isAuthorized = (requiredRole) => {
  return (req, res, next) => {
    if (!req.email) {
      return next(httpMessages.UNAUTHORIZED());
    }

    if (req.role !== requiredRole) {
      return next(
        httpMessages.FORBIDDEN(`Access to this resource by ${req.role}`)
      );
    }
    next();
  };
};

module.exports = { isAuthorized };
