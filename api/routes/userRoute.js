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

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  registerUser
);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);


// Route (Only Admin can access)
router.get("/all", authenticate, getAllUsers);
router.put(
  "/update/:id",
  authenticate,
  upload.fields([{ name: "profilePic" }, { name: "resume" }]),
  updateUser
);

// Login with user
router.patch("/req-deletion/:userId", authenticate, requestDeletion);

// admin only
router.delete("/approve-deletion/:id", authenticate, approveDeletion);

module.exports = router;
