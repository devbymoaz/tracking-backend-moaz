const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const getAllItems = async () => {
  try {
    const [rows] = await db.query("SELECT * FROM items");
    const itemsWithVolume = rows.map((item) => {
      const dimensions = item.dimensions
        .split("x")
        .map((d) => parseFloat(d.trim()));

      const volume = dimensions.reduce((acc, dim) => acc * dim, 1);
      return { ...item, volume };
    });

    data = {
      suitcase: itemsWithVolume.filter((item) => item.category === "Suitcase"),
      envelop: itemsWithVolume.filter((item) => item.category === "Envelop"),
      parcel: itemsWithVolume.filter((item) => item.category === "Parcel"),
      packet: itemsWithVolume.filter((item) => item.category === "Packet"),
    };

    return data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new ApiError(500, "Database error occurred while retrieving items.");
  }
};
module.exports = { getAllItems };
