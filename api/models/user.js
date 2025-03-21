const { DataTypes, UUIDV4 } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("Admin", "Employer", "JobSeeker"),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resume: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "CompanyProfiles", // Ensure correct model name
        key: "id",
      },
      onDelete: "SET NULL", // When a company is deleted, set users' companyId to NULL
      onUpdate: "CASCADE",
    },
    experience: {
      type: DataTypes.INTEGER, // Experience in years
      allowNull: true,
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING), // Array of skills
      allowNull: true,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletionRequested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletionApproved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Common Fields
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "Users", key: "id" },
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true, // Allow NULL for the first Admin
      references: { model: "Users", key: "id" },
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "Users", key: "id" },
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
    paranoid: true, // Enables deletedAt
  }
);

// Hash password before creating user
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

module.exports = User;
