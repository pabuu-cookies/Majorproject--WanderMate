const jwt = require("jsonwebtoken");
const HttpMessage = require("../middlewares/HttpMessage");
const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.log("unauthorized");
    throw HttpMessage.UNAUTHORIZED;
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      throw HttpMessage.FORBIDDEN;
    }
    req.userId = decoded.userId;
    next();
  });
}

module.exports = authenticateToken;
