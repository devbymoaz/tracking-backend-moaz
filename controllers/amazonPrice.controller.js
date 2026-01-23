const { ApiError } = require("../utils/ApiError");
const {
  createAmazonPrice,
  updateAmazonPrice,
  deleteAmazonPrice,
  getAllAmazonPrices,
  getAmazonPriceById,
} = require("../models/address_book");

const createAmazonPriceController = async (req, res, next) => {
  try {
    const { price } = req.body;
    if (price === undefined) {
      return next(new ApiError(400, "price is required."));
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice)) {
      return next(new ApiError(400, "price must be a valid number."));
    }
    const row = await createAmazonPrice(numericPrice);
    return res.status(201).json({
      message: "Amazon price created successfully.",
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

const updateAmazonPriceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    if (price === undefined) {
      return next(new ApiError(400, "price is required."));
    }
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice)) {
      return next(new ApiError(400, "price must be a valid number."));
    }
    const row = await updateAmazonPrice(id, numericPrice);
    return res.status(200).json({
      message: "Amazon price updated successfully.",
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAmazonPriceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteAmazonPrice(id);
    return res.status(200).json({
      message: "Amazon price deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonPricesController = async (req, res, next) => {
  try {
    const rows = await getAllAmazonPrices();
    return res.status(200).json({
      message: "Amazon prices retrieved successfully.",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonPriceByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await getAmazonPriceById(id);
    if (!row) {
      return next(new ApiError(404, "Amazon price not found."));
    }
    return res.status(200).json({
      message: "Amazon price retrieved successfully.",
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAmazonPriceController,
  updateAmazonPriceController,
  deleteAmazonPriceController,
  getAmazonPricesController,
  getAmazonPriceByIdController,
};
