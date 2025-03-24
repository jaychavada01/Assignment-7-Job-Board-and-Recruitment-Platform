const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  getAllUsers,
  updateUser,
  requestDeletion,
  approveDeletion,
} = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { authRole } = require("../middleware/authRole");

const router = express.Router();

// Public routes (No authentication required)
router.post(
  "/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login", loginUser);

// Apply authentication middleware only to protected routes
router.use(authenticate);

router.post("/logout", logoutUser);

// ** Routes (Only Admin) **
router.get("/all", authRole("Admin"), getAllUsers);
router.put(
  "/update/:id",
  authRole("Admin"),
  upload.fields([{ name: "profilePic" }, { name: "resume" }]),
  updateUser
);
router.delete("/approve-deletion/:id", authRole("Admin"), approveDeletion);

// Request deletion by user
router.patch("/req-deletion/:userId", requestDeletion);

module.exports = router;
