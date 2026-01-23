const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { getAllItems } = require("../models/items.model");

const fetchAllItems = asyncHandler(async (req, res, next) => {
  const data = await getAllItems();

  return res
    .status(200)
    .json(new ApiResponse(200, data, "All items fetched successfully"));
});

module.exports = { fetchAllItems };
