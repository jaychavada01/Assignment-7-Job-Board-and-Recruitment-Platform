const path = require("path");
const multer = require("multer");
const fs = require("fs");

// Ensure upload directories exist
const uploadDirs = {
  profilePic: path.join(__dirname, "../uploads/profilepic"),
  resume: path.join(__dirname, "../uploads/resume"),
  companyLogo: path.join(__dirname, "../uploads/companyLogo"),
};

// Create directories if they don’t exist
Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") {
      cb(null, uploadDirs.resume);
    } else if (file.fieldname === "profilePic") {
      cb(null, uploadDirs.profilePic);
    } else if (file.fieldname === "companyLogo") {
      cb(null, uploadDirs.companyLogo);
    } else {
      return cb(new Error("Invalid file fieldname"), false);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedResumeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (file.fieldname === "profilePic" || file.fieldname === "companyLogo") {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, JPG, and PNG images are allowed"), false);
    }
  } else if (file.fieldname === "resume") {
    if (!allowedResumeTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
    }
  } else {
    return cb(new Error("Invalid file fieldname"), false);
  }

  cb(null, true);
};

// Multer Upload Middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter,
});

module.exports = upload;
