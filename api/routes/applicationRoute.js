const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createApplication,
  getAllApplications,
  updateApplication,
  closeApplication,
  deleteApplication,
  filterApplications,
} = require("../controllers/applicationController.js");
const { STATUS_CODES } = require("../config/constant.js");

// Middleware to restrict employers
const employerAuth = (req, res, next) => {
  if (req.user.role !== "Employer") {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: "Only employers can perform this action." });
  }
  next();
};

// Job Seeker Applies
router.post("/create", authenticate, createApplication);

// Employer Only Routes
router.get("/all", authenticate, employerAuth, getAllApplications);
router.put("/update/:id", authenticate, employerAuth, updateApplication);
router.put("/close/:id", authenticate, employerAuth, closeApplication);
router.delete("/delete/:id", authenticate, employerAuth, deleteApplication);

// Filter Applications (Employer Only)
router.get("/filter", authenticate, employerAuth, filterApplications);

module.exports = router;
