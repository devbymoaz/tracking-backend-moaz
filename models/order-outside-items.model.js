const { db } = require("../db");

const createOrderOutsideItems = async (values) => {

  const placeholders = values
    .map(() => `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .join(", ");

  try {
    const [result] = await db.query(
      `INSERT INTO order_outside_items 
        (ship_from, ship_to, category, box_name, length, width, height, weight, currency, price, quantity, sku, description, hs_code, order_id)      
        VALUES ${placeholders}`,
      values.flat()
    );

    const startId = result.insertId; // First ID of inserted rows
    const endId = startId + result.affectedRows - 1; // Last ID of inserted rows

    const [rows] = await db.query(
      `SELECT * FROM order_outside_items WHERE id BETWEEN ? AND ?`,
      [startId, endId]
    );

    return rows;
  } catch (error) {
    console.error("Test insert error:", error.message);
    throw error;
  }
};

module.exports = {
  createOrderOutsideItems,
};
