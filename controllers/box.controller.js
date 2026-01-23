const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { getSelectedBox } = require("../models/box.model");
const { v4: uuidv4 } = require("uuid");

const BoxData = asyncHandler(async (req, res, next) => {
  const { ship_to, category, weight, ship_from } = req.query;
  const selectedBoxData = await getSelectedBox(
    ship_to,
    category,
    weight,
    ship_from
  );

  // Handle empty result from database
  if (!selectedBoxData || selectedBoxData.length === 0) {
    return res
      .status(200) // Changed from 404 to 200
      .json(
        new ApiResponse(
          200,
          [],
          "No services available for selected country, category & weight"
        )
      );
  }

  // Filter out "No service" entries and create response array
  const responseData = selectedBoxData
    ?.map((boxItem) => {
      // Find the price column (the one that's not in the additional columns list)
      const additionalColumns = [
        "days_envelop",
        "insurance",
        "rating",
        "courier",
        "service",
        "elect_liquids",
      ];
      const priceColumn = Object.keys(boxItem).find(
        (key) => !additionalColumns.includes(key)
      );

      if (!priceColumn) {
        return null;
      }

      const priceValue = boxItem[priceColumn];

      // Check if service is available
      if (priceValue && priceValue.toString().toLowerCase() === "no service") {
        return null;
      }

      return {
        id: uuidv4(),
        weight: priceColumn
          .replace(/^(box_|paket_|suitcase_|doc_)/, "")
          .replace(/kg$/, "")
          .toLowerCase(),
        price: priceValue,
        type: priceColumn,
        days_envelop: boxItem.days_envelop,
        insurance: boxItem.insurance,
        rating: boxItem.rating,
        courier: boxItem.courier,
        service: boxItem.service,
        elect_liquids: boxItem.elect_liquids,
      };
    })
    .filter((item) => item !== null); // Remove null entries

  // Return response with data (even if empty after filtering)
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseData,
        responseData.length === 0
          ? "No services available for selected country, category & weight"
          : `${responseData.length} box option(s) found for selected country & weight`
      )
    );
});

module.exports = { BoxData };
