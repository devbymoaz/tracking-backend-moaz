const { db } = require("../db/index");

const markShippingLabelUploaded = async (orderId) => {
  const updateQuery = `
    UPDATE orders 
    SET custom_shipping_label = TRUE 
    WHERE id = ?
  `;
  const [result] = await db.query(updateQuery, [orderId]);
  return result;
};

module.exports = { markShippingLabelUploaded };
