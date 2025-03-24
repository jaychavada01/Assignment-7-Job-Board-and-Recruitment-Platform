const { Op } = require("sequelize");
const { User, Feedback } = require("../models");
const Validator = require("validatorjs");
const { VALIDATION_RULES, STATUS_CODES } = require("../config/constant");

const validateRequest = (data, rules) => {
  const validation = new Validator(data, rules);
  if (validation.fails()) {
    return validation.errors.all();
  }
  return null;
};

// ** Create Feedback (Employer Only)
exports.createFeedback = async (req, res) => {
  try {
    const errors = validateRequest(req.body, VALIDATION_RULES.ADD_FEEDBACK);
    if (errors) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: errors });
    }

    const { jobSeekerId, feedbackText, rating } = req.body;
    const employerId = req.user.id;

    // Ensure job seeker exists
    const jobSeeker = await User.findByPk(jobSeekerId);
    if (!jobSeeker || jobSeeker.role !== "JobSeeker") {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job Seeker not found." });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      where: { employerId, jobSeekerId },
    });
    if (existingFeedback) {
      return res.status(STATUS_CODES.CONFLICT).json({
        message: "You have already submitted feedback for this Job Seeker.",
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      employerId,
      jobSeekerId,
      feedbackText,
      rating,
      createdBy: employerId,
    });

    return res
      .status(STATUS_CODES.CREATED)
      .json({ message: "Feedback submitted successfully.", feedback });
  } catch (error) {
    console.error(error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: "Internal Server Error." });
  }
};

// ** Get Feedback for a Job Seeker (Only JobSeekers)
exports.getFeedbackForJobSeeker = async (req, res) => {
  try {
    const { jobSeekerId } = req.params;

    // Ensure that job seeker exists
    const jobSeeker = await User.findByPk(jobSeekerId);
    if (!jobSeeker || jobSeeker.role !== "JobSeeker") {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job Seeker not found." });
    }

    // Fetch feedback given to the Job Seeker
    const feedbacks = await Feedback.findAll({
      where: { jobSeekerId, isDeleted: false },
      include: [{ model: User, as: "employer", attributes: ["id", "name"] }],
    });

    return res.status(STATUS_CODES.SUCCESS).json({ feedbacks });
  } catch (error) {
    console.error(error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: "Internal Server Error." });
  }
};

// ** Update Feedback (Employer Only)
exports.updateFeedback = async (req, res) => {
  try {
    const errors = validateRequest(req.body, VALIDATION_RULES.UPDATE_FEEDBACK);
    if (errors) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: errors });
    }

    const { id } = req.params; // feedback id
    const { feedbackText, rating } = req.body;
    const employerId = req.user.id;

    // Find the feedback record
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Feedback not found." });
    }

    // Ensure only the feedback creator can update it
    if (feedback.employerId !== employerId) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You can only update your own feedback." });
    }

    // Update feedback
    await feedback.update({ feedbackText, rating, updatedBy: employerId });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Feedback updated successfully.", feedback });
  } catch (error) {
    console.error(error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: "Internal Server Error." });
  }
};

// ** Soft Delete Feedback (Employer Only)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const employerId = req.user.id;

    // Find feedback
    const feedback = await Feedback.findByPk(id);
    if (!feedback) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Feedback not found." });
    }

    // Ensure only the feedback creator can delete it
    if (feedback.employerId !== employerId) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You can only delete your own feedback." });
    }

    // Soft delete feedback
    await feedback.update({
      isDeleted: true,
      deletedBy: employerId,
      deletedAt: new Date(),
    });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Feedback deleted successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: "Internal Server Error." });
  }
};
