const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");

const createAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ where: { role: "Admin" } });

    if (!existingAdmin) {
      const adminId = uuidv4();
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      await User.create({
        id: adminId,
        role: "Admin",
        email: "admin@master.com",
        password: hashedPassword,
        name: "Super Admin",
        isActive: true,
        createdBy: adminId, // Set the same admin ID
      });

      console.log("Successfully created admin");
    } else {
      console.log("Admin already exists");
    }
  } catch (error) {
    console.error("Error creating admin", error);
  }
};

module.exports = createAdmin;
