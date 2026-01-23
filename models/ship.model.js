const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const getAllShipFormCountries = async () => {
  try {
    const [rows] = await db.query(
      "SELECT ship_from FROM rates WHERE ship_from IS NOT NULL"
    );
    return rows.map((row) => row.ship_from);
  } catch (error) {
    console.error("Error fetching ship_from list:", error);
    throw new ApiError(500, "Database error occurred while retrieving user.");
  }
};

const getAllShipToCountries = async () => {
  try {
    const [rows] = await db.query("SELECT ship_to FROM parcel_rates");
    return rows.map((row) => row.ship_to);
  } catch (error) {
    console.error("Error fetching ship_to list:", error);
    throw new ApiError(500, "Database error occurred while retrieving user.");
  }
};

module.exports = {
  getAllShipFormCountries,
  getAllShipToCountries,
};
