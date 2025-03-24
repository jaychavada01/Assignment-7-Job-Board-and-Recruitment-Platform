const express = require("express");
const {
  registerCompany,
  updateCompany,
} = require("../controllers/companyController");
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");
const { authRole } = require("../middleware/authRole");

const router = express.Router();

router.use(authenticate);

// ** Only Admin Route
router.post(
  "/register",
  authRole("Admin"),
  upload.single("companyLogo"),
  registerCompany
);
router.put(
  "/update/:id",
  authRole("Admin"),
  upload.single("companyLogo"),
  updateCompany
);

module.exports = router;
