const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const getSelectedCardsRates = async (
  selectedShipTo,
  selectedCategory,
  selectedShipFrom
) => {
  try {
    let mysqlQuery = "";

    // Ensure selectedCategory is sanitized and valid
    const validCategories = [
      "Envelope",
      "Parcel",
      "Packets",
      "Suitcases",
      "Amazon address",
    ];
    if (!validCategories.includes(selectedCategory)) {
      throw new ApiError(400, `Invalid category: ${selectedCategory}`);
    }

    // Construct query based on selectedCategory - now filtering by ship_to AND ship_from
    switch (selectedCategory) {
      case "Envelope":
        mysqlQuery = `SELECT id, doc_half_kg, days_envelop AS days, insurance, rating, courier, service, elect_liquids 
           FROM parcel_rates 
           WHERE ship_to = ? AND ship_from = ?`;
        break;
      case "Parcel":
      case "Amazon address":
        mysqlQuery = `SELECT id, box_5kg, box_10kg, box_15kg, box_20kg, box_25kg, days_parcel AS days, insurance, rating, courier, service, elect_liquids 
           FROM parcel_rates 
           WHERE ship_to = ? AND ship_from = ?`;
        break;
      case "Packets":
        mysqlQuery = `SELECT id, paket_1kg, paket_2kg, days_parcel AS days, insurance, rating, courier, service, elect_liquids 
           FROM parcel_rates 
           WHERE ship_to = ? AND ship_from = ?`;
        break;
      case "Suitcases":
        mysqlQuery = `SELECT id, suitcase_10kg, suitcase_20kg, suitcase_30kg, days_parcel AS days, insurance, rating, courier, service, elect_liquids 
           FROM parcel_rates 
           WHERE ship_to = ? AND ship_from = ?`;
        break;
      default:
        mysqlQuery = `SELECT id, * FROM parcel_rates WHERE ship_to = ? AND ship_from = ?`;
        break;
    }

    const [rows] = await db.query(mysqlQuery, [
      selectedShipTo,
      selectedShipFrom,
    ]);

    // If Amazon address and no rates found, return a dummy object so controller can fill in admin prices
    if (selectedCategory === "Amazon address" && rows.length === 0) {
      return [
        {
          id: "admin_rate",
          box_5kg: 0,
          box_10kg: 0,
          box_15kg: 0,
          box_20kg: 0,
          box_25kg: 0,
          days: "5-7 days", // Default placeholder
          insurance: "Included",
          rating: "5.0",
          courier: "Standard",
          service: "Standard",
          elect_liquids: "No",
        },
      ];
    }

    if (rows.length > 0) {
      return rows;
    }

    throw new ApiError(
      404,
      `No rates found for ship_to: ${selectedShipTo}, ship_from: ${selectedShipFrom} with category: ${selectedCategory}`
    );
  } catch (error) {
    console.error("Error fetching rates:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Database error occurred while retrieving rates.");
  }
};


module.exports = {
  getSelectedCardsRates,
};
