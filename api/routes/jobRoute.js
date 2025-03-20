const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { createJob, approveJob } = require("../controllers/jobController");

// Routes for Employers
router.post("/create", authenticate, createJob);

// Admin only
router.put("/:id/approve", authenticate, approveJob);
// router.put("/:id/reject", authenticate, jobController.rejectJob);
// router.get("/", jobController.getAllJobs);
// router.get("/my-jobs", authenticate, jobController.getEmployerJobs); 


module.exports = router;
