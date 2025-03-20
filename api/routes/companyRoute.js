const express = require("express");
const { registerCompany, updateCompany } = require("../controllers/companyController");
const upload = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authenticate,upload.single("companyLogo"), registerCompany);
router.put("/update/:id", authenticate,upload.single("companyLogo"), updateCompany);

module.exports = router;