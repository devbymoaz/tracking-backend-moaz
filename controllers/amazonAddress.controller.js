const { ApiError } = require("../utils/ApiError");
const {
  createAmazonAddress,
  updateAmazonAddress,
  deleteAmazonAddress,
  getAllAmazonAddresses,
  getAmazonAddressById,
} = require("../models/address_book");

const createAmazonAddressController = async (req, res, next) => {
  try {
    const {
      display_name,
      company_name,
      street_address,
      city,
      postcode,
      country,
    } = req.body;

    if (
      !display_name ||
      !company_name ||
      !street_address ||
      !city ||
      !postcode ||
      !country
    ) {
      return next(
        new ApiError(
          400,
          "display_name, company_name, street_address, city, postcode and country are required."
        )
      );
    }

    const address = await createAmazonAddress(
      display_name,
      company_name,
      street_address,
      city,
      postcode,
      country
    );

    return res.status(201).json({
      message: "Amazon address created successfully.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const updateAmazonAddressController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      display_name,
      company_name,
      street_address,
      city,
      postcode,
      country,
    } = req.body;

    if (
      !display_name ||
      !company_name ||
      !street_address ||
      !city ||
      !postcode ||
      !country
    ) {
      return next(
        new ApiError(
          400,
          "display_name, company_name, street_address, city, postcode and country are required."
        )
      );
    }

    const address = await updateAmazonAddress(
      id,
      display_name,
      company_name,
      street_address,
      city,
      postcode,
      country
    );

    return res.status(200).json({
      message: "Amazon address updated successfully.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAmazonAddressController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deleteAmazonAddress(id);

    return res.status(200).json({
      message: "Amazon address deleted successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonAddressesController = async (req, res, next) => {
  try {
    const addresses = await getAllAmazonAddresses();
    return res.status(200).json({
      message: "Amazon addresses retrieved successfully.",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

const getAmazonAddressByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const address = await getAmazonAddressById(id);

    if (!address) {
      return next(new ApiError(404, "Amazon address not found."));
    }

    return res.status(200).json({
      message: "Amazon address retrieved successfully.",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAmazonAddressController,
  updateAmazonAddressController,
  deleteAmazonAddressController,
  getAmazonAddressesController,
  getAmazonAddressByIdController,
};
