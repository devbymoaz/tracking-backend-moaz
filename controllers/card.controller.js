// Controller: card.controller.js
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { getSelectedCardsRates } = require("../models/card.model");
const { getAmazonCountryPriceByCountry } = require("../models/address_book");
const { getConfigFile } = require("../utils/helper");

const selectedCategoryCardRates = asyncHandler(async (req, res, next) => {
  const { ship_to, category, ship_from } = req.query;
  const selectedCardRates = await getSelectedCardsRates(
    ship_to,
    category,
    ship_from
  );

  let amazonCountryPrice = null;
  if (category === "Amazon address") {
    amazonCountryPrice = await getAmazonCountryPriceByCountry(ship_to);
  }

  let responseData = [];

  const cardRatesArray = Array.isArray(selectedCardRates)
    ? selectedCardRates
    : [selectedCardRates];

  cardRatesArray.forEach((cardRate) => {
    let cardData;

    switch (category) {
      case "Envelope":
        cardData = Object.entries(cardRate)
          .filter(([key, value]) => key.startsWith("doc_"))
          .map(([key, value]) => {
            return {
              id: `${cardRate.id}_${key}`, // Combine DB ID with key for uniqueness
              type: "envelope",
              dimensions: getConfigFile("BoxDimensions").find(
                (box) => box.name === key
              ),
              weight: getWeightFromKey(key, "doc_"),
              price: value,
              days: cardRate.days,
              insurance: cardRate.insurance,
              rating: cardRate.rating,
              courier: cardRate.courier,
              service: cardRate.service,
              elect_liquids: cardRate.elect_liquids,
            };
          });
        break;
      case "Parcel":
        cardData = Object.entries(cardRate)
          .filter(([key, value]) => key.startsWith("box_"))
          .map(([key, value]) => {
            return {
              id: `${cardRate.id}_${key}`, // Combine DB ID with key for uniqueness
              type: "parcel",
              dimensions: getConfigFile("BoxDimensions").find(
                (box) => box.name === key
              ),
              weight: getWeightFromKey(key, "box_"),
              price: value,
              days: cardRate.days,
              insurance: cardRate.insurance,
              rating: cardRate.rating,
              courier: cardRate.courier,
              service: cardRate.service,
              elect_liquids: cardRate.elect_liquids,
            };
          });
        break;
      case "Amazon address":
        cardData = Object.entries(cardRate)
          .filter(([key, value]) => key.startsWith("box_"))
          .map(([key, value]) => {
            const finalPrice =
              amazonCountryPrice && amazonCountryPrice.price != null
                ? amazonCountryPrice.price
                : value;

            return {
              id: `${cardRate.id}_${key}`,
              type: "parcel",
              dimensions: getConfigFile("BoxDimensions").find(
                (box) => box.name === key
              ),
              weight: getWeightFromKey(key, "box_"),
              price: finalPrice,
              days: cardRate.days,
              insurance: cardRate.insurance,
              rating: cardRate.rating,
              courier: cardRate.courier,
              service: cardRate.service,
              elect_liquids: cardRate.elect_liquids,
            };
          });
        break;
      case "Packets":
        cardData = Object.entries(cardRate)
          .filter(([key, value]) => key.startsWith("paket_"))
          .map(([key, value]) => {
            return {
              id: `${cardRate.id}_${key}`, // Combine DB ID with key for uniqueness
              type: "packet",
              dimensions: getConfigFile("BoxDimensions").find(
                (box) => box.name === key
              ),
              weight: getWeightFromKey(key, "paket_"),
              price: value,
              days: cardRate.days,
              insurance: cardRate.insurance,
              rating: cardRate.rating,
              courier: cardRate.courier,
              service: cardRate.service,
              elect_liquids: cardRate.elect_liquids,
            };
          });
        break;
      case "Suitcases":
        cardData = Object.entries(cardRate)
          .filter(([key, value]) => key.startsWith("suitcase_"))
          .map(([key, value]) => {
            return {
              id: `${cardRate.id}_${key}`, // Combine DB ID with key for uniqueness
              type: "suitcase",
              dimensions: getConfigFile("BoxDimensions").find(
                (box) => box.name === key
              ),
              weight: getWeightFromKey(key, "suitcase_"),
              price: value,
              days: cardRate.days,
              insurance: cardRate.insurance,
              rating: cardRate.rating,
              courier: cardRate.courier,
              service: cardRate.service,
              elect_liquids: cardRate.elect_liquids,
            };
          });
        break;
      default:
        cardData = [];
        break;
    }

    if (cardData && cardData.length > 0) {
      responseData = [...responseData, ...cardData];
    }
  });

  // Sort the data by weight, from lightest to heaviest
  responseData.sort((a, b) => a.weight - b.weight);

  // Find the lowest available price (excluding "No service")
  let initialValue = "No service";
  
  if (responseData.length > 0) {
    // Filter out "No service" prices and find the minimum
    const availablePrices = responseData
      .map(item => item.price)
      .filter(price => price !== "No service" && price !== null && price !== undefined);
    
    if (availablePrices.length > 0) {
      // Convert to numbers and find minimum
      const numericPrices = availablePrices
        .map(price => parseFloat(price))
        .filter(price => !isNaN(price));
      
      if (numericPrices.length > 0) {
        initialValue = Math.min(...numericPrices);
      }
    }
    // If no available prices found, initialValue remains "No service"
  }

  const queryResponse = { initialValue, data: responseData };
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        queryResponse,
        "Selected Categories for Rates is fetched successfully"
      )
    );
});

// Helper function to extract numerical weight from key
function getWeightFromKey(key, prefix) {
  const weightStr = key.replace(prefix, "");

  // Handle special case for "half_kg"
  if (weightStr === "half_kg") {
    return 0.5;
  }

  // Extract numeric part, e.g., "5kg" -> 5
  const numericWeight = parseFloat(weightStr.replace(/[^0-9.]/g, ""));
  return numericWeight || 0;
}

module.exports = { selectedCategoryCardRates };
