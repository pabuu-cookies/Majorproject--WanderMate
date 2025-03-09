const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY;

class TokenUtils {
  static generateToken(payload, expiresIn = "1d") {
    return jwt.sign(payload, SECRET_KEY, { expiresIn });
  }
}

if (require.main === module) {
  const testPayload = {
    email: "pabitra@example.com",
    userId: "67ab20faccc2d8f67d689f71",
    role: "user",
  };

  const token = TokenUtils.generateToken(testPayload);
  console.log("Generated Token:", token);
}

module.exports = TokenUtils;
