const { db } = require("../db");
const { ApiError } = require("../utils/ApiError");

const createCustomBox = async (
  userId,
  boxName,
  length,
  width,
  height,
  category
) => {
  try {
    const mysqlQuery =
      "INSERT INTO custom_box (user_id, box_name, length, width, height, category) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.query(mysqlQuery, [
      userId,
      boxName,
      length,
      width,
      height,
      category,
    ]);
    return {
      id: result.insertId,
      userId,
      boxName,
      length,
      width,
      height,
      category,
    };
  } catch (error) {
    console.error("Error inserting custom box:", error);
    throw new ApiError(
      500,
      "Database error occurred while inserting custom box."
    );
  }
};

const getCustomBoxes = async (userId) => {
  try {
    const mysqlQuery =
      "SELECT id, box_name, length, width, height, category FROM custom_box WHERE user_id = ?";
    const [rows] = await db.query(mysqlQuery, [userId]);
    return rows;
  } catch (error) {
    console.error("Error retrieving custom boxes:", error);
    throw new ApiError(
      500,
      "Database error occurred while fetching custom boxes."
    );
  }
};

const updateCustomBox = async (
  boxId,
  userId,
  boxName,
  length,
  width,
  height,
  category
) => {
  try {
    const mysqlQuery = `
      UPDATE custom_box 
      SET box_name = ?, length = ?, width = ?, height = ?, category = ?
      WHERE id = ? AND user_id = ?
    `;
    const [result] = await db.query(mysqlQuery, [
      boxName,
      length,
      width,
      height,
      category,
      boxId,
      userId,
    ]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Custom box not found or user unauthorized");
    }

    return {
      id: boxId,
      userId,
      boxName,
      length,
      width,
      height,
      category,
    };
  } catch (error) {
    console.error("Error updating custom box:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      "Database error occurred while updating custom box."
    );
  }
};

const deleteCustomBox = async (boxId, userId) => {
  try {
    const mysqlQuery = "DELETE FROM custom_box WHERE id = ? AND user_id = ?";
    const [result] = await db.query(mysqlQuery, [boxId, userId]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Custom box not found or user unauthorized");
    }

    return { message: "Custom box deleted successfully" };
  } catch (error) {
    console.error("Error deleting custom box:", error);
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      500,
      "Database error occurred while deleting custom box."
    );
  }
};

module.exports = {
  createCustomBox,
  getCustomBoxes,
  updateCustomBox,
  deleteCustomBox,
};
