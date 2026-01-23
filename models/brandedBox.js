const { db } = require("../db");
const { ApiError } = require("../utils/ApiError");
const setCategory = (category) => {
  if (category === "envelop") {
    return "Envelop";
  }
  if (category === "parcel") {
    return "Parcel";
  }
  if (category === "packet") {
    return "Packet";
  }
  if (category === "suitcase") {
    return "Suitcase";
  }
};
const createBrandedBoxes = async (
  boxName,
  length,
  width,
  height,
  category,
  visibility
) => {
  try {
    const dimensions = `${length}x${width}x${height}`;
    const type = "custom";
    const mysqlQuery =
      "INSERT INTO items (name, dimensions, category, visibility, type) VALUES ( ?, ?, ?, ?, ?)";
    const [result] = await db.query(mysqlQuery, [
      boxName,
      dimensions,
      category,
      visibility,
      type,
    ]);
    return {
      id: result.insertId,
      boxName,
      category,
      visibility,
      type,
    };
  } catch (error) {
    console.error("Error inserting custom box:", error);
    throw new ApiError(
      500,
      "Database error occurred while inserting custom box."
    );
  }
};

const getBrandedBoxes = async (userId, role) => {
  try {
    let mysqlQuery;
    let queryParams;
    if (role === "admin") {
      mysqlQuery = `
        SELECT id, box_name, length, width, height, category, visibility
        FROM branded_boxes
        WHERE user_id = ?`;
      queryParams = [userId];
    } else {
      mysqlQuery = `
        SELECT id, box_name, length, width, height, category, visibility
        FROM branded_boxes
        WHERE visibility = 'both'`;
      queryParams = [userId];
    }

    const [rows] = await db.query(mysqlQuery, queryParams);
    return rows;
  } catch (error) {
    console.error("Error retrieving branded boxes:", error);
    throw new ApiError(
      500,
      "Database error occurred while fetching custom boxes."
    );
  }
};
const updateBrandedBox = async (
  id,
  userId,
  boxName,
  length,
  width,
  height,
  category,
  visibility
) => {
  try {
    const dimensions = `${length}x${width}x${height}`;
    const mysqlQuery = `
        UPDATE items
        SET name = ?, dimensions = ?, category = ?, visibility = ?
        WHERE id = ?
      `;
    const [result] = await db.query(mysqlQuery, [
      boxName,
      dimensions,
      category,
      visibility,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Branded box not found or not authorized.");
    }

    return { id, userId, boxName, length, width, height, category, visibility };
  } catch (error) {
    console.error("Error updating branded box:", error);
    throw new ApiError(500, "Database error occurred while updating box.");
  }
};

// Delete Branded Box
const deleteBrandedBox = async (id, userId) => {
  try {
    const mysqlQuery = `
        DELETE FROM items
        WHERE id = ?
      `;
    const [result] = await db.query(mysqlQuery, [id, userId]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Branded box not found or not authorized.");
    }

    return { message: "Branded box deleted successfully", id };
  } catch (error) {
    console.error("Error deleting branded box:", error);
    throw new ApiError(500, "Database error occurred while deleting box.");
  }
};
module.exports = {
  createBrandedBoxes,
  getBrandedBoxes,
  updateBrandedBox,
  deleteBrandedBox,
};
