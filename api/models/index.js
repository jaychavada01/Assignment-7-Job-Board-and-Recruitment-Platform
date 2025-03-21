const Application = require("./application");
const CompanyProfile = require("./companyProfile");
const Feedback = require("./feedBack");
const InterviewInvitation = require("./interviewInvitation");
const Job = require("./job");
const User = require("./user");

// Company & Users
CompanyProfile.hasMany(User, {
  foreignKey: "companyId",
  as: "employees",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
User.belongsTo(CompanyProfile, {
  foreignKey: "companyId",
  as: "companyProfile",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// User (Employer) & Job
User.hasMany(Job, {
  foreignKey: "employerId",
  as: "jobs",
  onDelete: "CASCADE",
});
Job.belongsTo(User, {
  foreignKey: "employerId",
  as: "employer",
  onDelete: "CASCADE",
});

// Job & CompanyProfile
User.belongsTo(CompanyProfile, { foreignKey: "companyId", as: "company" });

// 🔹 Job & Application (One-to-Many)
Job.hasMany(Application, {
  foreignKey: "jobId",
  as: "applications",
  onDelete: "CASCADE",
});
Application.belongsTo(Job, {
  foreignKey: "jobId",
  as: "job",
  onDelete: "CASCADE",
});

// 🔹 User (JobSeeker) & Application (One-to-Many)
User.hasMany(Application, {
  foreignKey: "jobSeekerId",
  as: "applications",
  onDelete: "CASCADE",
});
Application.belongsTo(User, {
  foreignKey: "jobSeekerId",
  as: "jobSeeker",
  onDelete: "CASCADE",
});

module.exports = {
  User,
  CompanyProfile,
  Job,
  Application,
  Feedback,
  InterviewInvitation,
};
