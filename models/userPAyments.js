const { db } = require("../db");
const { ApiError } = require("../utils/ApiError");

const storePayment = async (user_id, amount) => {
  try {
    // Check if the user already exists in the wallet
    const [existingWallet] = await db.query(
      "SELECT * FROM wallet WHERE user_id = ?",
      [user_id]
    );
    let result;
    if (existingWallet.length > 0) {
      // User exists, so update the amount (ensure it's treated as a number)
      const currentAmount = parseFloat(existingWallet[0].amount);
      const newAmount = currentAmount + parseFloat(amount); // Make sure both values are treated as numbers
      result = await db.query(
        "UPDATE wallet SET amount = ? WHERE user_id = ?",
        [newAmount, user_id]
      );
      return {
        message: "Payment updated successfully.",
        user_id,
        amount: newAmount,
      };
    } else {
      // User does not exist, so insert a new record
      result = await db.query(
        "INSERT INTO wallet (user_id, amount) VALUES (?, ?)",
        [user_id, amount]
      );
      return {
        id: result[0].insertId,
        user_id,
        amount,
      };
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    throw new ApiError(
      500,
      "Database error occurred while processing payment."
    );
  }
};

const deductPayment = async (user_id, amount) => {
  try {
    // Check if the user exists in the wallet
    const [existingWallet] = await db.query(
      "SELECT * FROM wallet WHERE user_id = ?",
      [user_id]
    );

    if (existingWallet.length === 0) {
      throw new ApiError(404, "User wallet not found");
    }

    const currentAmount = parseFloat(existingWallet[0].amount);
    const deductionAmount = parseFloat(amount);

    // Check if user has sufficient balance
    if (currentAmount < deductionAmount) {
      throw new ApiError(400, "Insufficient balance in wallet");
    }

    const newAmount = currentAmount - deductionAmount;

    // Update the wallet with new amount
    await db.query("UPDATE wallet SET amount = ? WHERE user_id = ?", [
      newAmount,
      user_id,
    ]);

    return {
      message: "Amount deducted successfully.",
      user_id,
      previous_amount: currentAmount,
      deducted_amount: deductionAmount,
      remaining_amount: newAmount,
    };
  } catch (error) {
    console.error("Error deducting payment:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Database error occurred while deducting payment.");
  }
};

const getPaymentsByUserId = async (user_id) => {
  try {
    const mysqlQuery = `SELECT * FROM wallet WHERE user_id = ?`;
    const [rows] = await db.query(mysqlQuery, [user_id]);
    return rows;
  } catch (error) {
    console.error("Error retrieving payments:", error);
    throw new ApiError(
      500,
      "Database error occurred while retrieving payments."
    );
  }
};

module.exports = {
  storePayment,
  deductPayment,
  getPaymentsByUserId,
};
