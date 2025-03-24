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
  searchJob,
} = require("../controllers/jobController");
const { authRole } = require("../middleware/authRole");

router.use(authenticate);

// Employer Routes
router.post("/create",authRole("Employer"), createJob);
router.get("/all",authRole("Employer"), getAllJobs);
router.put("/update/:id",authRole("Employer"), updateJob);
router.put("/close/:id",authRole("Employer"), closeJob);
router.delete("/delete/:id",authRole("Employer"), deleteJob);

// Admin Routes
router.put("/approve/:id", authRole("Admin"), approveJob);
router.put("/reject/:id",authRole("Admin"), rejectJob);

// JobSeeker Routes
router.get("/search",authRole("JobSeeker"), searchJob);
module.exports = router;
