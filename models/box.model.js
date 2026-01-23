const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const getSelectedBox = async (ship_to, category, weight, ship_from) => {
  try {
    let priceColumn = "";
    const additionalColumns =
      "days_envelop, insurance, rating, courier, service, elect_liquids";

    if (category === "Parcel") {
      if (weight <= 5) {
        priceColumn = "box_5kg";
      } else if (weight > 5 && weight <= 10) {
        priceColumn = "box_10kg";
      } else if (weight > 10 && weight <= 15) {
        priceColumn = "box_15kg";
      } else if (weight > 15 && weight <= 20) {
        priceColumn = "box_20kg";
      } else if (weight > 20 && weight <= 25) {
        priceColumn = "box_25kg";
      } else {
        return []; // Return empty array instead of {}
      }
    } else if (category === "Packets") {
      if (weight <= 1) {
        priceColumn = "paket_1kg";
      } else if (weight > 1 && weight <= 2) {
        priceColumn = "paket_2kg";
      } else {
        return []; // Return empty array instead of {}
      }
    } else if (category === "Suitcases") {
      if (weight > 0 && weight <= 10) {
        priceColumn = "suitcase_10kg";
      } else if (weight > 10 && weight <= 20) {
        priceColumn = "suitcase_20kg";
      } else {
        return []; // Return empty array instead of {}
      }
    } else if (category === "Envelope") {
      priceColumn = "doc_half_kg";
    } else {
      throw new ApiError(400, `Invalid category: ${category}`);
    }

    const mysqlQuery = `SELECT ${priceColumn}, ${additionalColumns} FROM parcel_rates WHERE ship_to = ? AND ship_from = ?`;
    const [rows] = await db.query(mysqlQuery, [ship_to, ship_from]);

    // Return rows directly - if empty, it will be an empty array
    return rows;
  } catch (error) {
    console.error("Error fetching rates:", error);
    throw new ApiError(500, "Database error occurred while retrieving rates.");
  }
};

module.exports = {
  getSelectedBox,
};
