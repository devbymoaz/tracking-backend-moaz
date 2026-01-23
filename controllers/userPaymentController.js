const {
  storePayment,
  getPaymentsByUserId,
  deductPayment,
} = require("../models/userPAyments");
const { ApiError } = require("../utils/ApiError");

const storePaymentController = async (req, res, next) => {
  try {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
      return next(new ApiError(400, "User ID and payment amount are required"));
    }

    const paymentDetails = await storePayment(user_id, amount);

    return res.status(201).json({
      message: "Payment stored successfully.",
      data: paymentDetails,
    });
  } catch (error) {
    next(error);
  }
};

const deductPaymentController = async (req, res, next) => {
  try {
    const { user_id, amount } = req.body;

    if (!user_id || !amount) {
      return next(
        new ApiError(400, "User ID and deduction amount are required")
      );
    }

    if (amount <= 0) {
      return next(new ApiError(400, "Deduction amount must be greater than 0"));
    }

    const paymentDetails = await deductPayment(user_id, amount);

    return res.status(200).json({
      message: "Amount deducted successfully.",
      data: paymentDetails,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentsByUserIdController = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return next(new ApiError(400, "User ID is required"));
    }

    const payments = await getPaymentsByUserId(user_id);

    return res.status(200).json({
      message: "Payments retrieved successfully.",
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  storePaymentController,
  deductPaymentController,
  getPaymentsByUserIdController,
};
