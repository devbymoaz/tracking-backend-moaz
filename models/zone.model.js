const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const getAllZones = async () => {
  const mysqlQuery = "SELECT DISTINCT zone FROM rates";
  try {
    const [rows] = await db.query(mysqlQuery);
    if (rows.length > 0) {
      const zones = rows.map((row) => row.zone);
      return zones;
    }

    throw new ApiError(404, `No zones are found... `);
  } catch (error) {
    console.error("Error fetching zone:", error);
    throw new ApiError(500, "Database error occurred while retrieving zones.");
  }
};

module.exports = {
  getAllZones,
};
