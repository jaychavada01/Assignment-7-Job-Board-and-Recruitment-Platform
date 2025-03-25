const jwt = require("jsonwebtoken");
const { STATUS_CODES } = require("../config/constant");
const User = require("../models/user");
const { getData } = require("../helpers/redis/getData");
const { setData } = require("../helpers/redis/setData");

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
    if (!decoded) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    // **Fetch user from Redis cache first**
    let user = await getData(decoded.role, decoded.id);
    if (!user) {
      // If not in cache, get from DB
      user = await User.findByPk(decoded.id);
      if (!user) {
        return res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: "User not found or invalid token" });
      }

      // Store the user in Redis cache for future requests
      await setData(user.role, user.id, user);
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
