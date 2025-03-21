const { Op } = require("sequelize");
const { Application, User, Job } = require("../models");
const { STATUS_CODES } = require("../config/constant");

//** Create Application (Job Seekers Apply) **
exports.createApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Ensure job exists
    const job = await Job.findOne({ where: { id: jobId, isDeleted: false } });
    if (!job) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Job not found." });
    }

    if (job.status === "Closed" || job.status === "Rejected") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Job is closed or rejected." });
    }

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({
      where: { jobId, jobSeekerId: req.user.id, isDeleted: false },
    });
    if (existingApplication) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ message: "You have already applied for this job." });
    }

    // Create application
    const application = await Application.create({
      jobId,
      jobSeekerId: req.user.id,
      status: "Applied",
      createdBy: req.user.id,
    });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Application submitted.", application });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};
// **** PENDING ****

// ** Get All Applications (Employer Only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: User,
          as: "jobSeeker",
          attributes: ["id"],
        },
        {
          model: Job,
          as: "job",
          attributes: ["id"],
        },
      ],
    });

    return res.status(STATUS_CODES.SUCCESS).json({ applications });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ✅ 3️⃣ Update Application (Only Employer Can Update)
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find application
    const application = await Application.findOne({
      where: { id, isDeleted: false },
    });
    if (!application) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Application not found." });
    }

    // Ensure employer is updating their job's application
    const job = await Job.findOne({
      where: { id: application.jobId, employerId: req.user.id },
    });
    if (!job) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You can only update applications for your jobs." });
    }

    // Update application
    await application.update({ status, updatedBy: req.user.id });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Application updated successfully.", application });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ✅ 4️⃣ Close Application (Employer Only)
exports.closeApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Find application
    const application = await Application.findOne({
      where: { id, isDeleted: false },
    });
    if (!application) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Application not found." });
    }

    // Ensure employer owns the job
    const job = await Job.findOne({
      where: { id: application.jobId, employerId: req.user.id },
    });
    if (!job) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You can only close applications for your jobs." });
    }

    // Mark application as closed
    await application.update({ status: "Rejected", updatedBy: req.user.id });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Application closed successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ✅ 5️⃣ Delete Application (Soft Delete)
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Find application
    const application = await Application.findOne({
      where: { id, isDeleted: false },
    });
    if (!application) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Application not found." });
    }

    // Ensure employer owns the job
    const job = await Job.findOne({
      where: { id: application.jobId, employerId: req.user.id },
    });
    if (!job) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You can only delete applications for your jobs." });
    }

    // Soft delete application
    await application.update({
      isDeleted: true,
      deletedBy: req.user.id,
      deletedAt: new Date(),
      isActive: false,
    });

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Application deleted successfully." });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ✅ 6️⃣ Filter Applications by Experience & Skills
exports.filterApplications = async (req, res) => {
  try {
    const { minExperience, skills } = req.query;
    const filters = {};

    if (minExperience) {
      filters["$jobSeeker.experience$"] = { [Op.gte]: parseInt(minExperience) };
    }
    if (skills) {
      filters["$jobSeeker.skills$"] = { [Op.overlap]: skills.split(",") };
    }

    const applications = await Application.findAll({
      where: filters,
      include: [
        {
          model: User,
          as: "jobSeeker",
          attributes: ["id", "name", "email", "experience", "skills"],
        },
        {
          model: Job,
          attributes: ["id", "title", "requiredExperience", "requiredSkills"],
        },
      ],
    });

    return res.status(STATUS_CODES.SUCCESS).json({ applications });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};
