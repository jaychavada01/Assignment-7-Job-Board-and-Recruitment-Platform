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
  trackAllApplications,
  scheduleInterview,
} = require("../controllers/applicationController.js");
const { authRole } = require("../middleware/authRole.js");

router.use(authenticate);

// Job Seeker Applies
router.post("/create", authRole("JobSeeker"),createApplication);

// Employer Only Routes
router.get("/all", authRole("Employer"),getAllApplications);
router.put("/update/:id", authRole("Employer"),updateApplication);
router.put("/close/:id", authRole("Employer"),closeApplication);
router.delete("/delete/:id", authRole("Employer"),deleteApplication);
router.get("/filter", authRole("Employer"),filterApplications);
router.get("/track-applications", authRole("Employer"),trackAllApplications);

// Interview schedule for Accepted Applicant
router.post("/schedule-interview/:applicationId", authRole("Employer"), scheduleInterview);

module.exports = router;
