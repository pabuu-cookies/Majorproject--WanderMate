const jwt = require("jsonwebtoken");
const HttpMessage = require("../middlewares/HttpMessage");
const SECRET_KEY = process.env.SECRET_KEY;

function authenticateToken(req, res, next) {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return res
        .status(HttpMessage.UNAUTHORIZED.statusCode)
        .json({ message: HttpMessage.UNAUTHORIZED.message });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log(err);
        return res
          .status(HttpMessage.FORBIDDEN.statusCode)
          .json({ message: HttpMessage.FORBIDDEN.message });
      }
      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    console.log(error);
    return res
      .status(HttpMessage.INTERNAL_SERVER_ERROR.statusCode)
      .json({ message: HttpMessage.INTERNAL_SERVER_ERROR.message });
  }
}

module.exports = authenticateToken;
