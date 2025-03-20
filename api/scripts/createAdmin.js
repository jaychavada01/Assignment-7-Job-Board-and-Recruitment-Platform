const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");

const createAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { role: "Admin" } });

    if (!existingAdmin) {
      const adminId = uuidv4();
      const adminPassword = "Admin@master"
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const admin = await User.create({
        id: adminId,
        role: "Admin",
        email: "admin@master.com",
        password: hashedPassword,
        name: "Super Admin",
        isActive: true,
        createdBy: adminId, // Set the same admin ID
      });

      // Generate JWT Token
      const token = jwt.sign(
        { id: admin.id, role: admin.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "15d",
        }
      );

      // Store accessToken
      await admin.update({ accessToken: token });

      console.log("Successfully created admin");
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.error("Error creating admin", error);
  }
};

module.exports = createAdmin;
