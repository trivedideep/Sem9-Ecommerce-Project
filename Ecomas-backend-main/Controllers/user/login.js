const jwt = require("jsonwebtoken");
const usertable = require("../../Models/usertable.js");
const secretKey = process.env.JWT_SECRET || "12345678910";
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usertable.findOne({ email });

    if (!user) {
      return res.status(401).send({ message: "Invalid credentials" });
    } else {
      if (!user.password || user.authProvider === "google") {
        return res
          .status(403)
          .send({ message: "Please sign in using Google for this account" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).send({ message: "Password not Match" });
      } else {
        const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: "100h" });
        res
          .status(200)
          .send({
            status: "successfull",
            message: "Login successful",
            token: token,
            isAdmin: user.isAdmin
          });
      }
    }
  } catch (errors) {
    res.status(500).send({ status: "failed", errors: errors.errors });
  }
};

module.exports = login;
