const express = require("express");
const { sequelize } = require("./config/database");
const createAdmin = require("./scripts/createAdmin");
const userRoute = require("./routes/userRoute");

const app = express();
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync({ alter: true });

    // routes
    app.use("/users", userRoute);

    // Create Admin on Server Start
    await createAdmin();
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
