require("./models");

const express = require("express");
const { sequelize } = require("./config/database");
const createAdmin = require("./scripts/createAdmin");
const userRoute = require("./routes/userRoute");
const companyRoute = require("./routes/companyRoute");
const jobRoute = require("./routes/jobRoute");
const applicationRoute = require("./routes/applicationRoute");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// routes
app.use("/users", userRoute);
app.use("/companies", companyRoute);
app.use("/jobs", jobRoute);
app.use("/applications", applicationRoute);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync({ alter: true });

    // Create Admin on Server Start
    await createAdmin();
  } catch (error) {
    console.error("Database connection error:", error);
  }
})();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
