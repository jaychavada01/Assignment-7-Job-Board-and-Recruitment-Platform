const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { authRole, bothRole } = require("../middleware/authRole");
const {
  createFeedback,
  updateFeedback,
  deleteFeedback,
  getFeedbackForJobSeeker,
} = require("../controllers/feedbackController");

router.use(authenticate);

// ** Employer routes
router.post("/", authRole("Employer"), createFeedback);
router.put("/update/:id", authRole("Employer"), updateFeedback);
router.delete("/delete/:id", authRole("Employer"), deleteFeedback);

// ** Employers & JobSeekers can view feedback
router.get(
  "/:jobSeekerId",
  bothRole(["Employer", "JobSeeker"]),
  getFeedbackForJobSeeker
);

module.exports = router;
