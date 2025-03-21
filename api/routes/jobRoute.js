const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createJob,
  approveJob,
  rejectJob,
  updateJob,
  getAllJobs,
  deleteJob,
  closeJob,
} = require("../controllers/jobController");

// Employer Routes
router.post("/create", authenticate, createJob);
router.get("/all", authenticate, getAllJobs);
router.put("/update/:id", authenticate, updateJob);
router.put("/close/:id", authenticate, closeJob);
router.delete("/delete/:id", authenticate, deleteJob);

// Admin Routes
router.put("/approve/:id", authenticate, approveJob);
router.put("/reject/:id", authenticate, rejectJob);

module.exports = router;
