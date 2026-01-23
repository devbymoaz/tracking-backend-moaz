const { db } = require("../db");

const createOrderItems = async (values) => {
  // Flatten the array of arrays into a single array for MySQL
  // Generate the placeholders for each row
  // 11 placeholders for each row
  // Use bulk insert with dynamic placeholders

  const placeholders = values.map(() => `( ?, ?, ?, ?, ?, ?, ?)`).join(", ");

  try {
    const [result] = await db.query(
      `INSERT INTO order_items (ship_from, ship_to, category, quantity, weight, price, order_id) VALUES ${placeholders}`,
      values.flat()
    );

    const startId = result.insertId; // First ID of inserted rows
    const endId = startId + result.affectedRows - 1; // Last ID of inserted rows

    const [rows] = await db.query(
      `SELECT * FROM order_items WHERE id BETWEEN ? AND ?`,
      [startId, endId]
    );

    return rows;
  } catch (error) {
    console.error("Test insert error:", error.message);
    throw error;
  }
};
const updateOrderItems = async (items) => {
  console.log(items, "ITEMSSSSS");
  const updatedRows = [];

  try {
    for (const item of items) {
      const { id, price, quantity, markup } = item;
      await db.query(
        `UPDATE order_items SET price = ?, quantity = ?, markup = ? WHERE id = ?`,
        [price, quantity, markup, id]
      );
      const [rows] = await db.query(`SELECT * FROM order_items WHERE id = ?`, [
        id,
      ]);

      if (rows.length > 0) {
        updatedRows.push(rows[0]);
      }
    }

    return updatedRows;
  } catch (error) {
    console.error("Error updating order items:", error.message);
    throw new Error("Failed to update order items.");
  }
};

const updateOrderOutsideItems = async (items) => {
  const updatedRows = [];
  const validFields = [
    "category",
    "box_name",
    "length",
    "width",
    "height",
    "weight",
    "sku",
    "currency",
    "description",
    "hs_code",
    "price",
    "markup",
    "quantity",
  ]; // Ensure these match your table column names.

  try {
    for (const item of items) {
      const { id, ...fieldsToUpdate } = item;

      // Ensure `id` is present
      if (!id) {
        throw new Error("Each item must have an 'id' to update.");
      }

      // Filter fields to only include valid columns
      const filteredFields = Object.keys(fieldsToUpdate)
        .filter((key) => validFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = fieldsToUpdate[key];
          return obj;
        }, {});

      if (Object.keys(filteredFields).length === 0) {
        throw new Error("No valid fields to update.");
      }

      // Dynamically construct the SET clause
      const fields = Object.keys(filteredFields);
      const values = Object.values(filteredFields);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");

      // Execute the update query
      await db.query(
        `UPDATE order_outside_items SET ${setClause} WHERE id = ?`,
        [...values, id]
      );

      // Fetch the updated row
      const [rows] = await db.query(
        `SELECT * FROM order_outside_items WHERE id = ?`,
        [id]
      );

      if (rows.length > 0) {
        updatedRows.push(rows[0]);
      }
    }

    return updatedRows;
  } catch (error) {
    console.error("Error updating order outside items:", error.message);
    throw new Error("Failed to update order outside items.");
  }
};

module.exports = {
  createOrderItems,
  updateOrderItems,
  updateOrderOutsideItems,
};
