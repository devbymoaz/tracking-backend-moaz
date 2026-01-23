const {
  findUserByEmail,
  createUser,
  deleteUser,
  getAllUsers,
  getUserById,
  createPasswordResetToken,
  resetPassword,
  verifyResetToken,
  updateUserDetails,
  changeUserPassword,
  findWalletByUserId,
} = require("../models/user.model");
const {
  validateRegistration,
  validateLogin,
  validatePasswordReset,
} = require("../utils/validators");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { verifyPassword, generateAuthToken } = require("../utils/helper");
const { sendPasswordResetEmail } = require("../utils/emailService");


const userRegistration = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, vat, phone } = req.body;
  const profileImage = req.file ? req.file.filename : null;

  const validationError = validateRegistration(
    name,
    email,
    phone,
    password,
    role
  );
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUsers = await findUserByEmail(normalizedEmail);
  if (existingUsers.length > 0) {
    return next(
      new ApiError(409, "Email already exists. Please use another email.")
    );
  }

  const data = await createUser(
    name,
    normalizedEmail,
    phone,
    is_activated=1,
    password,
    role,
    vat,
    profileImage
  );

  return res
    .status(201)
    .json(new ApiResponse(201, data, "User registered successfully!"));
});

const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, phone, is_activated } = req.body;

  const validationError = validateRegistration(
    name,
    email,
    phone,
    password="12345678",
    role="user"
  );
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUsers = await findUserByEmail(normalizedEmail);
  if (existingUsers.length > 0) {
    return next(
      new ApiError(409, "Email already exists. Please use another email.")
    );
  }

  const data = await createUser(
    name,
    normalizedEmail,
    phone,
    is_activated,
    password,
    role,
  );

  return res
    .status(201)
    .json(new ApiResponse(201, data, "User registered successfully!"));
});

const userLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input data
  const validationError = validateLogin(email, password);
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  // Check if user exists
  const user = await findUserByEmail(email);
  if (user.length === 0) {
    return next(new ApiError(400, "Invalid email or password."));
  }

  // Verify password
  const isPasswordCorrect = await verifyPassword(password, user[0].password);
  if (!isPasswordCorrect) {
    return next(new ApiError(400, "Invalid email or password."));
  }

  // Remove password from the user object before sending it in the response
  const { password: _, ...userWithoutPassword } = user[0];

  // Check wallet data for this user
  const walletData = await findWalletByUserId(userWithoutPassword.id);

  // Generate authentication token
  const token = generateAuthToken(userWithoutPassword);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userWithoutPassword,
        token,
        wallet_data: walletData,
      },
      "Login successful!"
    )
  );
});


const userDeletion = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const existingUser = await getUserById(id);

  if (!existingUser) {
    return next(new ApiError(404, "User not found."));
  }

  await deleteUser(id);
  return res
    .status(200)
    .json(new ApiResponse(200, existingUser, "User deleted successfully!"));
});

const usersList = asyncHandler(async (req, res, next) => {
  const users = await getAllUsers();
  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const userById = asyncHandler(async (req, res, next) => {
  const userId = req.params.id;
  const user = await getUserById(userId);
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

const userByEmail = asyncHandler(async (req, res, next) => {
  const email = req.params.id;
  const user = await findUserByEmail(email);
  if (!user) {
    return next(new ApiError(404, "User not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});
// Password reset request endpoint
const requestPasswordReset = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ApiError(400, "Email is required"));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const users = await findUserByEmail(normalizedEmail);
  // Don't reveal if user exists for security reasons
  if (users.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "If a user with that email exists, a password reset link has been sent."
        )
      );
  }

  // Generate and save reset token
  try {
    const resetToken = await createPasswordResetToken(normalizedEmail);

    // Send email with reset link
    await sendPasswordResetEmail(normalizedEmail, resetToken, users[0].name);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Password reset link has been sent to your email."
        )
      );
  } catch (error) {
    console.error("Password reset request error:", error);
    return next(new ApiError(500, "Failed to process password reset request."));
  }
});

// Verify reset token endpoint
const verifyPasswordResetToken = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new ApiError(400, "Reset token is required"));
  }

  const isValid = await verifyResetToken(token);

  if (!isValid) {
    return next(new ApiError(400, "Invalid or expired reset token"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { valid: true }, "Token is valid"));
});

// Reset password endpoint
const resetPasswordHandler = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  // Validate password
  const validationError = validatePasswordReset(password, confirmPassword);
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  try {
    // Reset password
    const user = await resetPassword(token, password);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email },
          "Password has been reset successfully"
        )
      );
  } catch (error) {
    console.error("Password reset error:", error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(500, "Failed to reset password."));
  }
});
const validateUserUpdate = (name, phone, address) => {
  if (!name || name.trim().length === 0) {
    return "Name is required and cannot be empty.";
  }

  if (name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }

  if (!phone || phone.trim().length === 0) {
    return "Phone number is required.";
  }

  // Basic phone validation (adjust pattern as needed)
  const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phonePattern.test(phone.replace(/[\s\-\(\)]/g, ""))) {
    return "Please enter a valid phone number.";
  }

  if (!address || address.trim().length === 0) {
    return "Address is required and cannot be empty.";
  }

  if (address.trim().length < 5) {
    return "Address must be at least 5 characters long.";
  }

  return null; // No validation errors
};

// Add this controller function
const updateUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;

  // Validate input data
  const validationError = validateUserUpdate(name, phone, address);
  if (validationError) {
    return next(new ApiError(400, validationError));
  }

  try {
    // Update user details
    const updatedUser = await updateUserDetails(
      id,
      name.trim(),
      phone.trim(),
      address.trim()
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedUser, "User details updated successfully!")
      );
  } catch (error) {
    console.error("Update user error:", error);
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(500, "Failed to update user details."));
  }
});
const changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const { id } = req.params; // assuming you pass userId as param

  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new ApiError(400, "All fields are required."));
  }

  if (newPassword !== confirmPassword) {
    return next(new ApiError(400, "New passwords do not match."));
  }

  try {
    await changeUserPassword(id, oldPassword, newPassword);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully."));
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(new ApiError(500, "Failed to change password."));
  }
});

module.exports = {
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
  registerUser,
  userByEmail,
};
