const express = require("express");
const {
  registerUser,
  userRegistration,
  userLogin,
  userDeletion,
  usersList,
  userById,
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPasswordHandler,
  updateUserById,
  changePassword,
  userByEmail,
} = require("../controllers/user.controller");

// router
const userRouter = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // local uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});

const upload = multer({ storage: storage });
// Authentication routes
userRouter.post("/login", userLogin);
userRouter.post("/register", upload.single("profileImage"), userRegistration);
userRouter.post("/register-user", registerUser);


// Password reset routes
userRouter.post("/forgot-password", requestPasswordReset);
userRouter.get("/reset-password/:token", verifyPasswordResetToken);
userRouter.post("/reset-password/:token", resetPasswordHandler);
userRouter.post("/change-password/:id", changePassword);


// User management routes
userRouter.get("/users", usersList);
userRouter.get("/users/:id", userById);
userRouter.get("/find-user/:id", userByEmail);
userRouter.put("/users/:id", updateUserById);
userRouter.delete("/users/:id", userDeletion);

module.exports = userRouter;
