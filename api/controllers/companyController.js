const { STATUS_CODES, VALIDATION_RULES } = require("../config/constant");
const CompanyProfile = require("../models/companyProfile");
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

//** Register Company (Admin Only) **
exports.registerCompany = async (req, res) => {
  try {
    // Check if the logged-in user is an Admin
    if (req.user.role !== "Admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Only Admins can create a company profile." });
    }

    // Validate request
    if (!validateRequest(req.body, VALIDATION_RULES.CREATE_COMPANY, res)) {
      return;
    }

    const {
      companyName,
      industry,
      companySize,
      location,
      website,
      about,
      foundedYear,
    } = req.body;

    // Check if company already exists
    const existingCompany = await CompanyProfile.findOne({
      where: { companyName },
    });
    if (existingCompany) {
      return res
        .status(STATUS_CODES.CONFLICT)
        .json({ message: "Company name already exists" });
    }

    // Create new company profile
    const newCompany = await CompanyProfile.create({
      companyName,
      companyLogo: req.file ? req.file.path : null,
      industry,
      companySize,
      location,
      website: website || null,
      about: about || null,
      foundedYear: foundedYear || null,
      createdBy: req.user.id, // Assign Admin ID as creator
    });

    return res.status(STATUS_CODES.CREATED).json({
      message: "Company registered successfully",
      company: newCompany,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};

//** Update Company Profile (Admin Only) **
exports.updateCompany = async (req, res) => {
  try {
    // Check if the logged-in user is an Admin
    if (req.user.role !== "Admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Only Admins can edit company profiles." });
    }

    const { id } = req.params;

    // Validate request
    if (!validateRequest(req.body, VALIDATION_RULES.CREATE_COMPANY, res)) {
      return;
    }

    // Find company by ID
    const company = await CompanyProfile.findByPk(id);
    if (!company) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Company not found" });
    }

    // Update company details
    await company.update({
      ...req.body,
      companyLogo: req.file ? req.file.path : company.companyLogo, // Update logo if a new file is uploaded
    });

    return res.status(STATUS_CODES.SUCCESS).json({
      message: "Company updated successfully",
      company,
    });
  } catch (error) {
    return res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ message: error.message });
  }
};
