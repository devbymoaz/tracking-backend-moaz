const { ApiError } = require("../utils/ApiError");
const {
  createAmazonCountryPrice,
  updateAmazonCountryPrice,
  deleteAmazonCountryPrice,
  getAllAmazonCountryPrices,
  getAmazonCountryPriceById,
  getAllAmazonCountries,
} = require("../models/address_book");

const createAmazonCountryPriceController = async (req, res, next) => {
  try {
    const { country, price, type } = req.body;

    if (!country) {
      return next(new ApiError(400, "country is required."));
    }

    let numericPrice = 0;
    if (price !== undefined) {
      numericPrice = Number(price);
      if (!Number.isFinite(numericPrice)) {
        return next(new ApiError(400, "price must be a valid number."));
      }
    }

    // Validate type if provided, default to 'receiver' if not
    const validType = type === "sender" ? "sender" : "receiver";

    const row = await createAmazonCountryPrice(
      country,
      numericPrice,
      validType
    );

    return res.status(201).json({
      message: "Amazon country price created successfully.",
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

const updateAmazonCountryPriceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { country, price, type } = req.body;

    if (!country) {
      return next(new ApiError(400, "country is required."));
    }

    let numericPrice;
    if (price !== undefined) {
      numericPrice = Number(price);
      if (!Number.isFinite(numericPrice)) {
        return next(new ApiError(400, "price must be a valid number."));
      }
    } else {
      const existingPrice = await getAmazonCountryPriceById(id);
      if (!existingPrice) {
        return next(new ApiError(404, "Amazon country price not found."));
      }
      numericPrice = existingPrice.price;
    }

    // Validate type if provided, default to 'receiver' if not
    const validType = type === "sender" ? "sender" : "receiver";

    const row = await updateAmazonCountryPrice(
      id,
      country,
      numericPrice,
      validType
    );

    return res.status(200).json({
      message: "Amazon country price updated successfully.",
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAmazonCountryPriceController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteAmazonCountryPrice(id);

    return res.status(200).json({
      message: "Amazon country price deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonCountryPricesController = async (req, res, next) => {
  try {
    const rows = await getAllAmazonCountryPrices();

    return res.status(200).json({
      message: "Amazon country prices retrieved successfully.",
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonCountryPriceByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const row = await getAmazonCountryPriceById(id);

    if (!row) {
      return next(new ApiError(404, "Amazon country price not found."));
    }

    return res.status(200).json({
      message: "Amazon country price retrieved successfully.",
      data: row,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonCountriesController = async (req, res, next) => {
  try {
    const countries = await getAllAmazonCountries();
    return res.status(200).json({
      message: "Amazon countries retrieved successfully.",
      data: countries,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAmazonCountryPriceController,
  updateAmazonCountryPriceController,
  deleteAmazonCountryPriceController,
  getAmazonCountryPricesController,
  getAmazonCountryPriceByIdController,
  getAmazonCountriesController,
};
