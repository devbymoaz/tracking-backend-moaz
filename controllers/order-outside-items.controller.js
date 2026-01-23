const {
  createOrderOutsideItems,
} = require("../models/order-outside-items.model");
const { ApiError } = require("../utils/ApiError");

const { validateOrderItems } = require("../utils/validators");

const postOrderOutsideItems = async (orderItems) => {
  if (!Array.isArray(orderItems) || orderItems?.length === 0) {
    throw new ApiError(
      400,
      "Invalid data. An array of outside items are required."
    );
  }

  // const validationErrors = validateOrderItems(orderItems);

  // if (validationErrors?.length > 0) {
  //   throw new ApiError(400, validationErrors);
  // }
  console.log("orderItems", orderItems[0]);
  const values = orderItems.map((order) => [
    order.ship_from,
    order.ship_to,
    order.category,
    order.box_name,
    order.length,
    order.width,
    order.height,
    order.weight,
    order.currency,
    order.price,
    order.quantity,
    order.sku,
    "order.description",
    order.hs_code,
    order.order_id,
  ]);

  // Create the user
  const responseData = await createOrderOutsideItems(values);

  return responseData;
};

module.exports = {
  postOrderOutsideItems,
};
