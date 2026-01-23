const bcrypt = require("bcrypt");
const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");
const crypto = require("crypto"); // Added for generating reset tokens

const findUserByEmail = async (email) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw new ApiError(500, "Database error occurred while retrieving user.");
  }
};

// New function to find wallet data by user ID
const findWalletByUserId = async (userId) => {
  try {
    const [rows] = await db.query("SELECT * FROM wallet WHERE user_id = ?", [
      userId,
    ]);

    // If wallet data exists, return it, otherwise return 0
    return rows.length > 0 ? rows[0] : 0;
  } catch (error) {
    console.error("Error finding wallet by user ID:", error);
    // In case of database error, return 0 to not break the login flow
    return 0;
  }
};

const createUser = async (
  name,
  email,
  phone,
  is_activated,
  password,
  role,
  vat,
  profileImage
) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO users (name, email, phone, password, role, vat, profile_image, is_activated) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        email,
        phone,
        hashedPassword,
        role,
        vat,
        profileImage,
        is_activated,
      ]
    );

    return {
      id: result.insertId,
      name,
      email,
      phone,
      role,
      vat,
      profileImage,
      is_activated,
    };
  } catch (error) {
    throw error;
  }
};


const deleteUser = async (userId) => {
  try {
    const user = await db.query("DELETE FROM users WHERE id = ?", [userId]);

    if (user.affectedRows === 0) {
      throw new Error("User not found or already deleted.");
    }

    return userId;
  } catch (error) {
    throw error;
  }
};

const getAllUsers = async () => {
  try {
    const [rows] = await db.query("SELECT id,name,email,role FROM users");
    return rows;
  } catch (error) {
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const [rows] = await db.query(
      "SELECT id,name,email,role FROM users WHERE id = ?",
      [userId]
    ); // Fetch user by ID
    return rows[0];
  } catch (error) {
    throw error;
  }
};

const createPasswordResetToken = async (email) => {
  try {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour in milliseconds
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const [result] = await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [hashedToken, resetTokenExpiry, email]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "User with this email not found.");
    }

    return resetToken;
  } catch (error) {
    console.error("Error creating password reset token:", error);
    throw new ApiError(500, "Failed to create password reset token.");
  }
};

const resetPassword = async (resetToken, newPassword) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const [rows] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
      [hashedToken, new Date()]
    );

    if (rows.length === 0) {
      throw new ApiError(400, "Invalid or expired reset token.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result] = await db.query(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, rows[0].id]
    );

    return { id: rows[0].id, email: rows[0].email };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

const verifyResetToken = async (resetToken) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const [rows] = await db.query(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?",
      [hashedToken, new Date()]
    );

    if (rows.length === 0) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return false;
  }
};
const updateUserDetails = async (userId, name, phone, address) => {
  try {
    // First check if user exists
    const [existingUser] = await db.query("SELECT id FROM users WHERE id = ?", [
      userId,
    ]);

    if (existingUser.length === 0) {
      throw new ApiError(404, "User not found.");
    }

    // Update user details
    const [result] = await db.query(
      "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?",
      [name, phone, address, userId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(500, "Failed to update user details.");
    }

    // Return updated user details
    const [updatedUser] = await db.query(
      "SELECT id, name, email, phone, address, role FROM users WHERE id = ?",
      [userId]
    );

    return updatedUser[0];
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
};
const changeUserPassword = async (userId, oldPassword, newPassword) => {
  try {
    // Fetch current password hash
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      throw new ApiError(404, "User not found.");
    }

    const currentHashedPassword = rows[0].password;

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      throw new ApiError(400, "Current password is incorrect.");
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, userId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(500, "Failed to update password.");
    }

    return true;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

module.exports = {
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
};
