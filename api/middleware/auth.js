const jwt = require("jsonwebtoken");
const { STATUS_CODES } = require("../config/constant");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Access denied, no token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ? Finding the user
    const user = await User.findOne({ where: { id: decoded.id } });
    if (!user) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "User not found or invalid token" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "User is logged out. Please log in again." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(STATUS_CODES.UNAUTHORIZED)
      .json({ message: "Unauthorized access!" });
  }
};
