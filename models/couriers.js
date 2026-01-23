const { db } = require("../db");
const { ApiError } = require("../utils/ApiError");

const createCourier = async (courierData, logo) => {
  try {
    const mysqlQuery = `INSERT INTO couriers (name, logo) VALUES (?, ?)`;
    const [result] = await db.query(mysqlQuery, [courierData.name, logo]);
    return { id: result.insertId, name: courierData.name };
  } catch (error) {
    console.error("Error inserting courier:", error);
    throw new ApiError(500, "Database error occurred while inserting courier.");
  }
};

const getAllCouriers = async () => {
  try {
    const mysqlQuery = "SELECT * FROM couriers";
    const [rows] = await db.query(mysqlQuery);
    return rows;
  } catch (error) {
    console.error("Error retrieving couriers:", error);
    throw new ApiError(500, "Database error occurred while fetching couriers.");
  }
};

const getCourierById = async (id) => {
  try {
    const mysqlQuery = "SELECT * FROM couriers WHERE id = ?";
    const [rows] = await db.query(mysqlQuery, [id]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error("Error retrieving courier:", error);
    throw new ApiError(500, "Database error occurred while fetching courier.");
  }
};

const updateCourier = async (id, updatedData) => {
  try {
    let mysqlQuery;
    let queryParams;

    if (updatedData.logo) {
      // Update both name and logo
      mysqlQuery = `UPDATE couriers SET name = ?, logo = ? WHERE id = ?`;
      queryParams = [updatedData.name, updatedData.logo, id];
    } else {
      // Update only name
      mysqlQuery = `UPDATE couriers SET name = ? WHERE id = ?`;
      queryParams = [updatedData.name, id];
    }

    const [result] = await db.query(mysqlQuery, queryParams);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Courier not found");
    }

    return {
      id: parseInt(id),
      name: updatedData.name,
      logo: updatedData.logo || null,
    };
  } catch (error) {
    console.error("Error updating courier:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Database error occurred while updating courier.");
  }
};

const deleteCourier = async (id) => {
  try {
    const mysqlQuery = "DELETE FROM couriers WHERE id = ?";
    await db.query(mysqlQuery, [id]);
    return { message: "Courier deleted successfully." };
  } catch (error) {
    console.error("Error deleting courier:", error);
    throw new ApiError(500, "Database error occurred while deleting courier.");
  }
};

module.exports = {
  createCourier,
  getAllCouriers,
  getCourierById,
  updateCourier,
  deleteCourier,
};
