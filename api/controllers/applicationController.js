const { Op } = require("sequelize");
const { Application, User, Job, InterviewInvitation } = require("../models");
const { STATUS_CODES, VALIDATION_RULES } = require("../config/constant");
const sendEmail = require("../utils/mailer");
const Validator = require("validatorjs");

const validateRequest = (data, rules, res) => {
  const validation = new Validator(data, rules);
  if (validation.fails()) {
    res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: validation.errors.all() });
    return false;
  }
  return true;
};

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

// ** Get All Applications (Employer Only)
exports.getAllApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { isDeleted: false },
      include: [
        {
          model: User,
          as: "jobSeeker",
          attributes: ["id", "name", "resume", "experience", "skills"],
        },
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "title",
            "location",
            "experienceLevel",
            "salaryRange",
          ],
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

// ** Update Application (Employer Only)
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Find application with job and jobSeeker details
    const application = await Application.findOne({
      where: { id, isDeleted: false },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "employerId"],
          include: [
            {
              model: User,
              as: "employer",
              attributes: ["id", "name"], // Only for validation
            },
          ],
        },
        {
          model: User,
          as: "jobSeeker", // Reference job seeker from User model
          attributes: ["id", "name", "email"], // Ensure email is retrieved
        },
      ],
    });

    if (!application) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Application not found." });
    }

    // Ensure only the employer can update their own job's application
    if (application.job.employerId !== req.user.id) {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "You can only update applications for your jobs." });
    }

    // Check if job seeker email exists before sending an email
    if (!application.jobSeeker || !application.jobSeeker.email) {
      console.error("Job Seeker email is missing. Cannot send email.");
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message: "Job Seeker email not found. Cannot send update notification.",
      });
    }

    // Update application status
    await application.update({ status, updatedBy: req.user.id });

    // If application status is "Accepted", increment applicationCount
    if (status === "Accepted") {
      await application.job.increment("currentApplicants");
    }

    // Define email message based on status
    let additionalMessage = "";
    if (status === "Accepted") {
      additionalMessage =
        "<p>We will schedule your interview soon. Please check your email for further details.</p>";
    } else {
      additionalMessage =
        "<p>Thank you for your application. We appreciate your interest in the position.</p>";
    }

    // Send email notification to job seeker
    const { email, name } = application.jobSeeker;
    const { title } = application.job;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333;">Application Status Update</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Your application for the job <strong>${title}</strong> has been updated.</p>
          <p>New Status: <strong>${status}</strong></p>
          ${additionalMessage}
      </div>
    `;

    sendEmail(email, "Job Application Update", emailContent).catch((err) =>
      console.error("Email sending error:", err)
    );

    return res
      .status(STATUS_CODES.SUCCESS)
      .json({ message: "Application updated successfully.", application });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Close Application (Employer Only)
exports.closeApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // Find application
    const application = await Application.findOne({
      where: { id, isDeleted: false },
      include: [
        {
          model: Job,
          as: "job",
          attributes: [
            "id",
            "currentApplicants",
            "maxApplicants",
            "employerId",
          ],
        },
        {
          model: User,
          as: "jobSeeker", // Reference job seeker from User model
          attributes: ["id", "name", "email"], // Ensure email is retrieved
        },
      ],
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

    // Check if maxApplicants limit is reached
    if (application.job.currentApplicants >= application.job.maxApplicants) {
      await application.update({ status: "Rejected", updatedBy: req.user.id });

      return res.status(STATUS_CODES.SUCCESS).json({
        message: "Application closed as max applicants limit reached.",
      });
    }

    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message:
        "Application cannot be closed yet. Max applicants limit not reached.",
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Delete Application (Soft Delete)
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

// ** Filter Applications by Experience & Skills (Employer Only)
exports.filterApplications = async (req, res) => {
  try {
    const { jobId, experienceLevel, skills } = req.query;

    // Build the filtering criteria
    const whereClause = { isDeleted: false };
    if (jobId) whereClause.jobId = jobId;

    // Include job details and job seekers
    const applications = await Application.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "experienceLevel", "requiredSkills"],
        },
        {
          model: User,
          as: "jobSeeker",
          attributes: ["id", "name", "email", "skills"],
        },
      ],
    });

    let filteredApplications = applications;

    // ✅ Fix: Filter by experience level from the Job model
    if (experienceLevel) {
      filteredApplications = filteredApplications.filter(
        (app) => app.job.experienceLevel === experienceLevel
      );
    }

    // ✅ Fix: Filter applicants by required skills
    if (skills) {
      const skillArray = skills.split(",").map((s) => s.trim().toLowerCase());
      filteredApplications = filteredApplications.filter((app) =>
        app.jobSeeker.skills.some((skill) =>
          skillArray.includes(skill.toLowerCase())
        )
      );
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Applications fetched successfully.",
      applications: filteredApplications,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

//** Track & manage all applications for each job (Employer Only)
exports.trackAllApplications = async (req, res) => {
  try {
    const { id: employerId } = req.user;

    const jobs = await Job.findAll({
      where: { employerId, isDeleted: false },
      attributes: ["id", "title", "status", "createdAt"], // Fetch job details
      include: [
        {
          model: Application,
          as: "applications",
          attributes: ["id", "status", "createdAt"], // Fetch application details
          include: [
            {
              model: User,
              as: "jobSeeker",
              attributes: ["id", "name", "email"], // Fetch applicant details
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]], // Sort by newest jobs first
    });

    return res.status(STATUS_CODES.SUCCESS).json({ jobs });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

// ** Job Interview call
exports.scheduleInterview = async (req, res) => {
  try {
    if (!validateRequest(req.body, VALIDATION_RULES.SCHEDULE_INTERVIEW, res)) return;

    const { applicationId } = req.params; // Ensure applicationId comes from params
    const { scheduledDate, message, interviewLocation } = req.body;
    const employerId = req.user.id;

    // Validate required fields
    if (!scheduledDate) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Scheduled date is required." });
    }
    if (!interviewLocation) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ message: "Interview location is required." });
    }

    // Find the application
    const application = await Application.findOne({
      where: { id: applicationId, isDeleted: false },
      include: [
        {
          model: Job,
          as: "job",
          attributes: ["id", "title", "employerId"],
        },
        {
          model: User,
          as: "jobSeeker",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    // Check if the application exists
    if (!application) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Application not found." });
    }

    // Ensure only the employer of the job can schedule interviews
    if (application.job.employerId !== employerId) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        message: "You can only schedule interviews for your own job postings.",
      });
    }

    // Ensure the application status is "Accepted"
    if (application.status !== "Accepted") {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        message:
          "Interview can only be scheduled if the application is Accepted.",
      });
    }

    // Create interview invitation
    const interviewInvitation = await InterviewInvitation.create({
      applicationId,
      employerId,
      scheduledDate,
      interviewLocation,
      message,
      createdBy: employerId,
    });

    // Update the application status to "Interview Scheduled"
    await application.update({
      status: "Interview Scheduled",
      updatedBy: employerId,
    });

    // Send email notification to the job seeker
    const { email, name } = application.jobSeeker;
    const { title } = application.job;

    try {
      if (email) {
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Interview Invitation</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>We are pleased to inform you that you have been selected for an interview for the position of <strong>${title}</strong>.</p>
            <p><strong>Scheduled Date:</strong> ${new Date(
              scheduledDate
            ).toLocaleString()}</p>
            <p><strong>Location:</strong> ${interviewLocation}</p>
            ${
              message
                ? `<p><strong>Message from Employer:</strong> ${message}</p>`
                : ""
            }
            <p>Please confirm your availability by replying to this email.</p>
          </div>
        `;
        await sendEmail(email, "Interview Invitation", emailContent);
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
    }

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Interview scheduled successfully.",
      interviewInvitation,
    });
  } catch (error) {
    console.error("Error scheduling interview:", error);
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: "An error occurred while scheduling the interview." });
  }
};
