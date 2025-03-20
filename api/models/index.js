const Application = require("./application");
const CompanyProfile = require("./companyProfile");
const Feedback = require("./feedBack");
const InterviewInvitation = require("./interviewInvitation");
const Job = require("./job");
const User = require("./user");

// 🔹 Company & Users (One-to-Many)
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

// 🔹 User (Employer) & Job (One-to-Many)
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

// 🔹 Application & Feedback (One-to-One)
Application.hasOne(Feedback, {
  foreignKey: "applicationId",
  as: "feedback",
  onDelete: "CASCADE",
});
Feedback.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
  onDelete: "CASCADE",
});

// 🔹 Application & InterviewInvitation (One-to-One)
Application.hasOne(InterviewInvitation, {
  foreignKey: "applicationId",
  as: "interviewInvitation",
  onDelete: "CASCADE",
});
InterviewInvitation.belongsTo(Application, {
  foreignKey: "applicationId",
  as: "application",
  onDelete: "CASCADE",
});

// 🔹 User (Employer) & InterviewInvitation (One-to-Many)
User.hasMany(InterviewInvitation, {
  foreignKey: "employerId",
  as: "interviewInvitations",
  onDelete: "CASCADE",
});
InterviewInvitation.belongsTo(User, {
  foreignKey: "employerId",
  as: "employer",
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
