const { Op } = require("sequelize");
const { STATUS_CODES } = require("../config/constant");
const { Job, User, CompanyProfile, Application } = require("../models");

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
      requiredExperience,
      requiredSkills,
      maxApplicants,
    } = req.body;

    // Prevent duplicate job titles by the same employer
    const existingJob = await Job.findOne({
      where: { employerId: req.user.id, title, isDeleted: false },
    });

    if (existingJob) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ message: "A job with this title already exists." });
    }

    // Convert `requiredExperience` to an integer (default to 0 if invalid)
    const experience = parseInt(requiredExperience, 10) || 0;

    // Handle `requiredSkills` properly (ensure it's an array)
    let skillsArray = [];
    if (requiredSkills) {
      if (typeof requiredSkills === "string") {
        skillsArray = requiredSkills.split(",").map((skill) => skill.trim());
      } else if (Array.isArray(requiredSkills)) {
        skillsArray = requiredSkills;
      }
    }

    // Validate required fields
    if (experience < 0) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Experience level must be a positive number." });
    }

    if (skillsArray.length === 0) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "At least one required skill must be provided." });
    }

    // Ensure maxApplicants is a positive integer (default: 10)
    const maxApps = parseInt(maxApplicants, 10) || 10;
    if (maxApps < 1) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Max applicants must be at least 1." });
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
      requiredExperience: experience, // Converted integer
      requiredSkills: skillsArray, // Parsed array
      maxApplicants: maxApps,
      currentApplicants: 0, // Start from 0
      status: "Pending",
      createdBy: req.user.id,
    });

    return res.status(STATUS_CODES.CREATED).json({
      message: "Job created successfully. Awaiting admin approval.",
    });
  } catch (error) {
    console.error("Job creation error:", error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Job Approval (Admin Only)
exports.approveJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({ where: { id, isDeleted: false } });
    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    // Update job status, approvedBy, and approvedAt timestamp
    await job.update({
      status: "Approved",
      approvedBy: req.user.id,
      approvedAt: new Date(),
      updatedBy: req.user.id,
    });

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
exports.rejectJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findOne({ where: { id, isDeleted: false } });
    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    await job.update({
      status: "Rejected",
      rejectedBy: req.user.id,
      rejectedAt: new Date(),
      updatedBy: req.user.id,
    });
    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Job rejected successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Get all jobs (Employer only)
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: User,
          as: "employer",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: CompanyProfile,
              as: "company",
              attributes: ["companyName", "location"],
            },
          ],
        },
        {
          model: Application, // Include job applications
          as: "applications",
          attributes: ["id", "status"], // Fetch relevant fields
          include: [
            {
              model: User,
              as: "jobSeeker",
              attributes: ["id", "name", "email"], // Fetch applicant details
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // Sort by latest jobs first
    });

    return res.status(STATUS_CODES.SUCCESS).json({ jobs });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Update Job (Employer Only)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      industry,
      experienceLevel,
      salaryRange,
    } = req.body;

    // Find the job which is not deleted
    const job = await Job.findOne({ where: { id, isDeleted: false } });
    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    // Cannot update if job is closed or rejected
    if (job.status === "Closed" || job.status === "Rejected") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You cannot edit a closed or rejected job." });
    }

    // Check if any changes were made
    const updatedFields = {};
    if (title && title !== job.title) updatedFields.title = title;
    if (description && description !== job.description)
      updatedFields.description = description;
    if (location && location !== job.location)
      updatedFields.location = location;
    if (industry && industry !== job.industry)
      updatedFields.industry = industry;
    if (experienceLevel && experienceLevel !== job.experienceLevel)
      updatedFields.experienceLevel = experienceLevel;
    if (salaryRange && salaryRange !== job.salaryRange)
      updatedFields.salaryRange = salaryRange;

    // If no changes, return null
    if (Object.keys(updatedFields).length === 0) {
      return res
        .status(STATUS_CODES.NOT_MODIFIED)
        .json({ message: "Nothing modified!" });
    }

    // Apply updates
    updatedFields.updatedBy = req.user.id;
    await job.update(updatedFields);

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Job updated successfully.", job });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Soft Delete Job (Employer Only)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the job
    const job = await Job.findOne({ where: { id, isDeleted: false } });
    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    // Prevent deleting if the job is already closed or rejected
    if (job.status === "Closed" || job.status === "Rejected") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You cannot delete a closed or rejected job." });
    }

    // Soft delete
    await job.update({
      isDeleted: true,
      deletedBy: req.user.id,
      deletedAt: new Date(),
      isActive: false,
      isDeleted: true,
    });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Job deleted successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Close Job (Employer Only)
exports.closeJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the job
    const job = await Job.findOne({ where: { id, isDeleted: false } });
    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    // Prevent closing if it's already closed or rejected
    if (job.status === "Closed" || job.status === "Rejected") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Job is already closed or rejected." });
    }

    // Update status to Closed
    await job.update({ status: "Closed", updatedBy: req.user.id });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Job closed successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Search Job (JobSeeker Only)
exports.searchJob = async (req, res) => {
  try {
    const { location, industry, experienceLevel } = req.query;

    // Base search criteria (Only Approved & Not Deleted Jobs)
    const whereClause = { isDeleted: false, status: "Approved" };

    // Apply filters (case-insensitive & partial match)
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    if (industry) whereClause.industry = { [Op.iLike]: `%${industry}%` };
    if (experienceLevel) whereClause.experienceLevel = experienceLevel;

    // Fetch jobs matching the criteria
    const jobs = await Job.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "employer",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: CompanyProfile,
              as: "company",
              attributes: ["companyName", "location"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(STATUS_CODES.SUCCESS).json({ jobs });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};
