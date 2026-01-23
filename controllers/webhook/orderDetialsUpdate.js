const db = require("../../db");

async function updateOrderDeliveryState(shipmentId, status) {
    console.log("CONTROLLLLLLLLLLLLLL", shipmentId, status)
  try {
    const [result] = await db.query(
      "UPDATE orders SET delivery_state = ? WHERE easyship_shipment_id = ?",
      [status, shipmentId]
    );

    if (result.affectedRows > 0) {
      console.log(
        `✅ Order updated successfully | Shipment ID: ${shipmentId}, Status: ${status}`
      );
    } else {
      console.log(`⚠️ No matching order found for shipmentId: ${shipmentId}`);
    }
  } catch (err) {
    console.error("❌ Error updating order delivery state:", err);
  }
}

module.exports = { updateOrderDeliveryState };