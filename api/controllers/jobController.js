const { STATUS_CODES } = require("../config/constant");
const { Job } = require("../models");

// ** Job Creation (Employer only)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      industry,
      experienceLevel,
      salaryRange,
    } = req.body;

    // Check if the user is an Employer
    if (req.user.role !== "Employer") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Only Employers can create jobs." });
    }

    // Create the job with "Pending" status
    const job = await Job.create({
      employerId: req.user.id,
      title,
      description,
      location,
      industry,
      experienceLevel,
      salaryRange,
      status: "Pending",
      createdBy: req.user.id,
    });

    return res.status(STATUS_CODES.CREATED).json({
      message: "Job created successfully. Awaiting admin approval.",
      job,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Job Approval (Admin Only)
exports.approveJob = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Only admins can approve jobs." });
    }

    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    await job.update({ status: "Approved", updatedBy: req.user.id });
    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Job approved successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Job Reject (Admin Only)
exports.approveJob = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Only admins can approve jobs." });
    }

    const { id } = req.params;
    const job = await Job.findByPk(id);

    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    await job.update({ status: "Rejected", updatedBy: req.user.id });
    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Job rejected successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};
