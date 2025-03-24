const { STATUS_CODES } = require("../config/constant");

exports.authRole = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: `Only ${role}s can perform this action.` });
  }
  next();
};

exports.bothRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: `Only ${roles.join(" or ")} can perform this action.` });
  }
  next();
};
