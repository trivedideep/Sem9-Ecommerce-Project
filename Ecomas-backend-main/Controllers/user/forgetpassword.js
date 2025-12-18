const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const usertable = require("../../Models/usertable.js");

// POST /api/forgetpassword
// Body: { email }
// Response: reset link parts (userId + token) so the frontend route can build /forgetpassword/:id1/:id2
const forgetpassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ status: "failed", message: "Email is required" });
    }

    const user = await usertable.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 1000 * 60 * 30; // 30 minutes

    await usertable.findByIdAndUpdate(user._id, {
      resetPasswordToken: token,
      resetPasswordExpires: new Date(expires),
    });

    // In a real app we would email the link; here we return the pieces so the frontend route can use them.
    return res.status(200).json({
      status: "success",
      userId: user._id,
      token,
      message: "Password reset link generated",
    });
  } catch (error) {
    console.error("forgetpassword failed", error);
    return res.status(500).json({ status: "failed", message: "Unable to process request" });
  }
};

// PATCH /api/forgetpassword/:userId/:token
// Body: { password, confirm_password }
const resetpassword = async (req, res) => {
  try {
    const { userId, token } = req.params;
    const { password, confirm_password: confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ status: "failed", message: "Password and confirm password are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ status: "failed", message: "Passwords do not match" });
    }

    const user = await usertable.findOne({
      _id: userId,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ status: "failed", message: "Reset link is invalid or expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user.password = hashed;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    console.error("resetpassword failed", error);
    return res.status(500).json({ status: "failed", message: "Unable to reset password" });
  }
};

module.exports = { forgetpassword, resetpassword };
