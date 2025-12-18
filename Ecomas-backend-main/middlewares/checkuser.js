const jwt = require('jsonwebtoken');
const secretKey = "12345678910";
const checkuser = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    req.user = { id: 0 };
    next();
  } else {
    const token = authorizationHeader.slice(7).replace(/"/g, '');
    jwt.verify(token, "12345678910", (err, decoded) => {
      if (err) {
        req.user = { id: 0 };
      } else {
        req.user = decoded;
      }
      next();
    });
  }
};

module.exports = checkuser;
