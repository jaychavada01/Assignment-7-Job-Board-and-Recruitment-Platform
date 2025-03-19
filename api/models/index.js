const Application = require("./application");
const CompanyProfile = require("./companyProfile");
const Feedback = require("./feedBack");
const InterviewInvitation = require("./interviewInvitation");
const Job = require("./job");
const User = require("./user");

// User and CompanyProfile (One-to-One)
User.hasOne(CompanyProfile, { foreignKey: "createdBy" });
CompanyProfile.belongsTo(User, { foreignKey: "createdBy" });

// User (Employer) and Job (One-to-Many)
User.hasMany(Job, { foreignKey: "employerId", onDelete: "CASCADE" });
Job.belongsTo(User, { foreignKey: "employerId" });

// Job and Application (One-to-Many)
Job.hasMany(Application, { foreignKey: "jobId", onDelete: "CASCADE" });
Application.belongsTo(Job, { foreignKey: "jobId" });

// User (JobSeeker) and Application (One-to-Many)
User.hasMany(Application, { foreignKey: "jobSeekerId", onDelete: "CASCADE" });
Application.belongsTo(User, { foreignKey: "jobSeekerId" });

// Application and Feedback (One-to-One)
Application.hasOne(Feedback, {
  foreignKey: "applicationId",
  onDelete: "CASCADE",
});
Feedback.belongsTo(Application, { foreignKey: "applicationId" });

// User (Employer) and Feedback (One-to-Many)
User.hasMany(Feedback, { foreignKey: "employerId", onDelete: "CASCADE" });
Feedback.belongsTo(User, { foreignKey: "employerId" });

// User (JobSeeker) and Feedback (One-to-Many)
User.hasMany(Feedback, { foreignKey: "jobSeekerId", onDelete: "CASCADE" });
Feedback.belongsTo(User, { foreignKey: "jobSeekerId" });

// Application and InterviewInvitation (One-to-One)
Application.hasOne(InterviewInvitation, {
  foreignKey: "applicationId",
  onDelete: "CASCADE",
});
InterviewInvitation.belongsTo(Application, { foreignKey: "applicationId" });

// User (Employer) and InterviewInvitation (One-to-Many)
User.hasMany(InterviewInvitation, {
  foreignKey: "employerId",
  onDelete: "CASCADE",
});
InterviewInvitation.belongsTo(User, { foreignKey: "employerId" });

module.exports = {
  User,
  CompanyProfile,
  Job,
  Application,
  Feedback,
  InterviewInvitation,
};
