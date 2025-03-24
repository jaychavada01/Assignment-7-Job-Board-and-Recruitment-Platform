const Application = require("./application");
const CompanyProfile = require("./companyProfile");
const Feedback = require("./feedBack");
const InterviewInvitation = require("./interviewInvitation");
const Job = require("./job");
const User = require("./user");

// ✅ Company & Users
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

// ✅ User (Employer) & Job
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

// ✅ Job & CompanyProfile
User.belongsTo(CompanyProfile, { foreignKey: "companyId", as: "company" });

// ✅ Employer & Feedback (One-to-Many)
User.hasMany(Feedback, {
  foreignKey: "employerId",
  as: "givenFeedbacks",
  onDelete: "CASCADE",
});
Feedback.belongsTo(User, {
  foreignKey: "employerId",
  as: "employer",
  onDelete: "CASCADE",
});

// ✅ JobSeeker & Feedback (One-to-Many)
User.hasMany(Feedback, {
  foreignKey: "jobSeekerId",
  as: "receivedFeedbacks",
  onDelete: "CASCADE",
});
Feedback.belongsTo(User, {
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
