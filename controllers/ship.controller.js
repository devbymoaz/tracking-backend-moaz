const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  getAllShipFormCountries,
  getAllShipToCountries,
} = require("../models/ship.model");

const shipFromList = asyncHandler(async (req, res, next) => {
  const allShipFromCountries = await getAllShipFormCountries();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allShipFromCountries,
        "Ship From Countries fetched successfully"
      )
    );
});

const shipToList = asyncHandler(async (req, res, next) => {
  const allShipToCountries = await getAllShipToCountries();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        allShipToCountries,
        "Ship To Countries fetched successfully"
      )
    );
});

module.exports = { shipFromList, shipToList };
