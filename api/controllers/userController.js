const { STATUS_CODES, VALIDATION_RULES } = require("../config/constant");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const Validator = require("validatorjs");
const bcrypt = require("bcryptjs");
const CompanyProfile = require("../models/companyProfile");
const fs = require("fs");
const path = require("path");

const generateToken = async (user) => {
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  user.accessToken = token;
  await user.save();
  return token;
};

const validateRequest = (data, rules, res) => {
  const validation = new Validator(data, rules);
  if (validation.fails()) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: validation.errors.all() });
    return false;
  }
  return true;
};

// **Register User**
exports.registerUser = async (req, res) => {
  try {
    if (!validateRequest(req.body, VALIDATION_RULES.SIGNUP, res)) return;

    const { name, email, password, role, phone, companyId, createdBy } =
      req.body;

    // Validate Role
    if (!["Employer", "JobSeeker"].includes(role)) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Invalid role!" });
    }

    // Validate companyId (only for Employers)
    if (role === "Employer" && !companyId) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Company ID is required for Employers" });
    }
    if (role !== "Employer" && companyId) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Company ID is not allowed for JobSeekers" });
    }

    // Check email uniqueness based on email & role (ignoring ID)
    const existingUser = await User.findOne({
      where: { email, role },
      attributes: ["id"],
    });

    if (existingUser) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({
          message: "Email already in use for this role. Use a different email.",
        });
    }

    // Only process files if email is unique
    const profilePic = req.files?.profilePic
      ? req.files.profilePic[0].path
      : null;
    const resume = req.files?.resume ? req.files.resume[0].path : null;

    // Create User
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
      companyId: role === "Employer" ? companyId : null,
      profilePic,
      resume,
      createdBy: createdBy || null, // If admin registers user, assign createdBy
    });

    // If user registered themselves, assign createdBy to their own ID
    if (!createdBy) {
      newUser.createdBy = newUser.id;
      await newUser.save();
    }

    const token = await generateToken(newUser);

    return res.status(STATUS_CODES.CREATED).json({
      message: "User registered successfully",
      user: newUser,
      token,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// **Login User**
exports.loginUser = async (req, res) => {
  try {
    if (!validateRequest(req.body, VALIDATION_RULES.LOGIN, res)) return;

    const { email, password, role } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "Invalid email or password" });
    }

    // Admin Login Check
    if (user.role === "Admin") {
      // Manually compare the hardcoded password for Admin
      if (password !== "Admin@master") {
        return res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }
    } else {
      // Check role match (only for non-admin users)
      if (user.role !== role) {
        return res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: "Role mismatch. Please check your credentials." });
      }

      // Verify password for normal users
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: "Invalid email or password" });
      }
    }

    // Generate and store token
    const token = await generateToken(user);

    // Set user as active
    user.isActive = true;
    await user.save();

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Login successful",
      accessToken: token,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// **Logout User**
exports.logoutUser = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.accessToken) {
      return res
        .status(STATUS_CODES.UNAUTHORIZED)
        .json({ message: "User already logged out or session expired." });
    }

    // Clear accessToken & set isActive to false
    user.accessToken = null;
    user.isActive = false; // Set user as inactive
    await user.save();

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** View all users (Only Admin) **
exports.getAllUsers = async (req, res) => {
  try {
    // Ensure only admin can access this route
    if (req.user.role !== "Admin") {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        message: "Access denied. Only Admin can view users.",
      });
    }

    // Fetch all users, including soft-deleted ones
    const activeUsers = await User.findAll({
      where: { isDeleted: false },
      attributes: { exclude: ["password", "companyId"] },
      include: [
        {
          model: CompanyProfile,
          as: "companyProfile",
          attributes: ["companyName", "industry", "location", "status"],
        },
      ],
    });

    const deletedUsers = await User.findAll({
      where: { isDeleted: true },
      attributes: { exclude: ["password"] },
      paranoid: false, // Fetch soft-deleted users too
    });

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Users fetched successfully.",
      activeUsers,
      deletedUsers, // Separate deleted users
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
    });
  }
};

// ** Update User (Only Admin) **
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Access denied. Only Admin can update users." });
    }

    if (!validateRequest(req.body, VALIDATION_RULES.UPDATE_USER, res)) return;

    const user = await User.findByPk(req.params.id, { paranoid: false });
    if (!user) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "User not found." });
    }

    // Allowed fields to update
    const allowedUpdates = ["name", "phone", "companyId", "isBlocked"];

    // Extract updates from request
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedUpdates.includes(key))
    );

    // Handle file uploads (Multer stores files in req.files)
    if (req.files?.profilePic) {
      updates.profilePic = req.files.profilePic[0].path; // Ensure correct path
    }
    if (req.files?.resume) {
      updates.resume = req.files.resume[0].path;
    }

    // Update user
    await user.update({ ...updates, updatedBy: req.user.id });

    // Fetch updated user from DB
    const updatedUser = await User.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "profilePic",
        "resume",
        "isBlocked",
      ],
    });

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Account deletion req from user **
exports.requestDeletion = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        message: "User not found.",
      });
    }

    if (user.deletionRequested) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "Deletion request already submitted.",
      });
    }

    // Set deletionRequested to true
    await user.update({
      deletionRequested: true,
    });

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Deletion request submitted. Awaiting admin approval.",
    });
  } catch (error) {
    return res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message,
    });
  }
};

// ** Approve deletion by Admin **
exports.approveDeletion = async (req, res) => {
  try {
    // Ensure only admin can approve deletion
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Access denied. Only Admin can approve deletion requests.",
      });
    }

    const { id } = req.params;

    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    if (!user.deletionRequested) {
      return res.status(400).json({
        message: "No deletion request found for this user.",
      });
    }

    // Remove Profile Pic & Resume from Storage
    const deleteFile = (filePath) => {
      if (filePath) {
        const fullPath = path.join(__dirname, "../uploads", filePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    };

    deleteFile(user.profilePic);
    deleteFile(user.resume);

    await user.destroy();

    return res.status(200).json({
      message: "User deletion approved & user removed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
