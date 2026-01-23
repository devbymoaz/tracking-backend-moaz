const { createOrderItems, updateOrderItems, updateOrderOutsideItems } = require("../models/order-items.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateOrderItems } = require("../utils/validators");

const postOrderItems = async (orders) => {
  if (!Array.isArray(orders) || orders?.length === 0) {
    throw new ApiError(400, "Invalid data. An array of orders is required.");
  }

  // const validationErrors = validateOrderItems(orders);

  // if (validationErrors?.length > 0) {
  //   throw new ApiError(400, validationErrors);
  // }

  const values = orders.map((order) => [
    order.ship_from,
    order.ship_to,
    order.category,
    order.quantity,
    order.quantity,
    order.price,
    order.order_id,
  ]);

  // Create the user
  const responseData = await createOrderItems(values);

  return responseData;
};
const updateOrderItemsController = async (req, res, next) => {
  const { items } = req.body;

  // if (!Array.isArray(items) || items.length === 0) {
  //   throw new ApiError(400, "Invalid data. An array of items is required.");
  // }

  try {
    const updatedItems = await updateOrderItems(items);
    res.status(200).json(new ApiResponse(200, "Order items updated successfully", updatedItems));
  } catch (error) {
    next(error);
  }
};
const updateOrderOutsideItemsController = async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "Invalid data. An array of items is required.");
  }

  try {
    const updatedItems = await updateOrderOutsideItems(items);
    res.status(200).json(
      new ApiResponse(200, "Order outside items updated successfully", updatedItems)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  postOrderItems,
  updateOrderItemsController,
  updateOrderOutsideItemsController
};
