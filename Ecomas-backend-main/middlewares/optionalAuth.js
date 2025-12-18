const jwt = require("jsonwebtoken");
const secretKey = "12345678910";

const optionalAuth = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith("Bearer ")) {
      const token = authorizationHeader.slice(7).replace(/"/g, "");
      jwt.verify(token, secretKey, (err, decoded) => {
        if (!err && decoded) {
          req.user = decoded;
        }
        next();
      });
      return;
    }
  } catch (error) {
    // Silently ignore token errors for optional auth
  }

  next();
};

module.exports = optionalAuth;
