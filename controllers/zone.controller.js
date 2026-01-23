const { getAllZones } = require("../models/zone.model");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

const fetchAllZones = asyncHandler(async (req, res, next) => {
  const data = await getAllZones();

  return res
    .status(200)
    .json(new ApiResponse(200, data, "All Zones are fetched successfully"));
});

module.exports = { fetchAllZones };
