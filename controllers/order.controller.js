const { db } = require("../db");
const {
  getAllOrders,
  createOrder,
  addMarkUp,
  removeAnOrder,
  getOrderById,
  updateIsCustom,
  getFilteredOrders,
  getOrdersWithPickupState,
  getCustomOrders,
  updateCourierInOrder,
  getAllOrdersByEmail,
} = require("../models/order.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { europeanCountries } = require("../utils/constants");
const { sendCollectionDateChangeEmail, sendAddressChangeEmail } = require("../utils/emailService");
const { postOrderItems } = require("./order-items.controller");
const { postOrderOutsideItems } = require("./order-outside-items.controller");
const getCurrentOrder = async (orderId) => {
  try {
    const [rows] = await db.query(
      `SELECT collection_date, customer_details, delivery_details 
       FROM \`orders\` 
       WHERE id = ?`,
      [orderId]
    );
    
    if (rows.length === 0) {
      throw new ApiError(404, "Order not found");
    }
    
    return rows[0];
  } catch (error) {
    console.error("Error fetching current order:", error);
    throw new ApiError(500, "Database error occurred while fetching order");
  }
};
// const fetchAllOrders = asyncHandler(async (req, res, next) => {
//   const data = await getAllOrders();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, data, "All orders are fetched successfully"));
// });

const fetchAllOrders = asyncHandler(async (req, res, next) => {
  const data = await getAllOrders();

  return res
    .status(200)
    .json(new ApiResponse(200, data, "All orders are fetched successfully"));
});


const fetchOrdersByUser = asyncHandler(async (req, res, next) => {
  const { email } = req.query;
  const data = await getAllOrdersByEmail(email);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "All orders are fetched successfully"));
});

const fetchFilteredOrders = asyncHandler(async (req, res, next) => {
  // Get page number from query params, default to 1
  const page = parseInt(req.query.page) || 1;
  const limit = 75; // 10 records per page

  const data = await getFilteredOrders(page, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "Filtered orders are fetched successfully")
    );
});
const fetchOrdersWithPickupState = asyncHandler(async (req, res, next) => {
  // Get page number from query params, default to 1
  const page = parseInt(req.query.page) || 1;
  const limit = 75; // 10 records per page

  const data = await getOrdersWithPickupState(page, limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Orders with pickup_state not 'not_requested' are fetched successfully"
      )
    );
});
const updateTrackingUrl = asyncHandler(async (req, res, next) => {
  const { orderId, customTrackingUrl, custom_trackin_num } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    await updateOrderTrackingUrl(
      orderId,
      customTrackingUrl,
      custom_trackin_num
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, customTrackingUrl },
          "Tracking URL updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating tracking URL:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update tracking URL"));
  }
});
const updateCustomRemarks = asyncHandler(async (req, res, next) => {
  const { orderId, remarks } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    await updateRemarks(orderId, remarks);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, remarks },
          "Remarks updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating tracking URL:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update tracking URL"));
  }
});
const updateCollectionDateOrStatus = asyncHandler(async (req, res, next) => {
  const { orderId, date, status } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    await update_date_or_status(orderId, date, status);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, date, status },
          "Updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update"));
  }
});
const updateReason = asyncHandler(async (req, res, next) => {
  const { orderId, reason } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    await updateShippingReason(orderId, reason);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { orderId, reason }, "Reason updated successfully")
      );
  } catch (error) {
    console.error("Error updating reason for shipping:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update reason for shipping"));
  }
});
const updateTrackingNum = asyncHandler(async (req, res, next) => {
  const { orderId, custom_tracking_number } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    await updateTrackingNumber(orderId, custom_tracking_number);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, custom_tracking_number },
          "Tracking Number updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating Tracking number for shipping:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update Tracking Number for shipping"));
  }
});
const updateCollectionDate = asyncHandler(async (req, res, next) => {
  const { orderId, collection_date } = req.body;
  
  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    // Get current collection date before updating
    const currentOrder = await getCurrentOrder(orderId);
    
    // Update the pickup date
    await updatePickup(orderId, collection_date);
    
    // Check if collection date actually changed
    if (currentOrder.collection_date !== collection_date) {
      // Send notification email
      await sendCollectionDateChangeEmail(
        orderId, 
        currentOrder.collection_date, 
        collection_date
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, collection_date },
          "Collection Date updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating Collection Date", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update Collection Date"));
  }
});
const updateAddresses = asyncHandler(async (req, res, next) => {
  const { orderId, customer_details, delivery_details } = req.body;
  
  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    // Get current addresses before updating
    const currentOrder = await getCurrentOrder(orderId);
    
    // Update the addresses
    await updateAddressesModel(orderId, customer_details, delivery_details);
    
    // Check if addresses actually changed
    const customerChanged = JSON.stringify(currentOrder.customer_details) !== JSON.stringify(customer_details);
    const deliveryChanged = JSON.stringify(currentOrder.delivery_details) !== JSON.stringify(delivery_details);
    
    if (customerChanged || deliveryChanged) {
      // Send notification email
      await sendAddressChangeEmail(
        orderId,
        currentOrder.customer_details,
        currentOrder.delivery_details,
        customer_details,
        delivery_details
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, customer_details, delivery_details },
          "Address updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating Address", error);
    return res
      .status(500)
      .json(new ApiError(500, "Failed to update Addresses"));
  }
});
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  try {
    await updateOrder_status(orderId);

    return res
      .status(200)
      .json(new ApiResponse(200, { orderId }, "Order Cancelled successfully"));
  } catch (error) {
    console.error("Error cancelling order", error);
    return res.status(500).json(new ApiError(500, "Failed to cancel order"));
  }
});
// Model function to update tracking URL in the database
const updateOrderTrackingUrl = async (
  orderId,
  customTrackingUrl,
  custom_trackin_num
) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET custom_tracking_url = ? , custom_tracking_number = ? 
       WHERE id = ?`,
      [customTrackingUrl,custom_trackin_num, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating tracking URL in database:", error);
    throw new ApiError(
      500,
      "Database error occurred while updating tracking URL"
    );
  }
};
const updateRemarks = async (orderId, remarks) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET custom_remarks = ? 
       WHERE id = ?`,
      [remarks, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating tracking URL in database:", error);
    throw new ApiError(
      500,
      "Database error occurred while updating tracking URL"
    );
  }
};
const update_date_or_status = async (orderId, date, status) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\`
       SET collection_date = ?, status = ?
       WHERE id = ?`,
      [date, status, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating in database:", error);
    throw new ApiError(500, "Database error occurred while updating");
  }
};

const updateShippingReason = async (orderId, reason) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET shipping_reason = ? 
       WHERE id = ?`,
      [reason, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating shipping reason in database:", error);
    throw new ApiError(
      500,
      "Database error occurred while updating shipping reason"
    );
  }
};
const updateTrackingNumber = async (orderId, custom_tracking_number) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET custom_tracking_number = ? 
       WHERE id = ?`,
      [custom_tracking_number, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating shipping reason in database:", error);
    throw new ApiError(
      500,
      "Database error occurred while updating shipping reason"
    );
  }
};
const updatePickup = async (orderId, collection_date) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET collection_date = ? 
       WHERE id = ?`,
      [collection_date, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating:", error);
    throw new ApiError(500, "Database error occurred while updating");
  }
};
const updateAddressesModel = async (
  orderId,
  customer_details,
  delivery_details
) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\`
       SET customer_details = ?, 
           delivery_details = ?
       WHERE id = ?`,
      [customer_details, delivery_details, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating:", error);
    throw new ApiError(500, "Database error occurred while updating");
  }
};

const updateOrder_status = async (orderId, collection_date) => {
  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET status = ? 
       WHERE id = ?`,
      ["cancelled", orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return true;
  } catch (error) {
    console.error("Error updating:", error);
    throw new ApiError(500, "Database error occurred while updating");
  }
};
const fetchCustomOrders = asyncHandler(async (req, res, next) => {
  const data = await getCustomOrders();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        data,
        "Custom orders (is_custom = 1) are fetched successfully"
      )
    );
});
const updateCourier = asyncHandler(async (req, res) => {
  const { orderId, name } = req.body;

  if (!orderId || !name) {
    return res.status(400).json({ error: "orderId and name are required." });
  }

  const result = await updateCourierInOrder(orderId, name);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Courier updated successfully"));
});
const postOrder = asyncHandler(async (req, res, next) => {
  let {
    email,
    username,
    role,
    customer_details,
    delivery_details,
    billing_details,
    status,
    markup,
    order_items,
    order_outside_items,
    tracking_page_url,
    pickup_state,
    easyship_shipment_id,
    delivery_state,
    meta_data,
    custom_order_number,
    collection_address,
    collectionOption,
    collection_date_payload,
    notes,
    payment,
    boxes_data,
    total_price,
    upload_doc,
  } = req.body;

  // Handle file upload if present
  if (req.file) {
    upload_doc = req.file.filename;
  }

  // Helper to parse JSON strings if needed (for multipart/form-data)
  const parseIfString = (value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  customer_details = parseIfString(customer_details);
  delivery_details = parseIfString(delivery_details);
  billing_details = parseIfString(billing_details);
  meta_data = parseIfString(meta_data);
  boxes_data = parseIfString(boxes_data);
  order_items = parseIfString(order_items);
  order_outside_items = parseIfString(order_outside_items);

  console.log(total_price, "CUSTOME ORDER NUMBER HEREEEEEEEEEEEE");
  const data = await createOrder(
    email,
    username,
    role,
    customer_details,
    delivery_details,
    billing_details,
    status,
    markup,
    tracking_page_url,
    pickup_state,
    easyship_shipment_id,
    delivery_state,
    meta_data,
    custom_order_number,
    collection_address,
    collectionOption,
    collection_date_payload,
    notes,
    payment,
    boxes_data,
    order_items,
    order_outside_items,
    total_price,
    upload_doc
  );

  if (!data?.order?.id) {
    throw new ApiError(400, "Order creation failed.");
  }

  if (order_items && order_items?.length > 0) {
    const updatedOrderItems = order_items.map((item) => ({
      ...item,
      order_id: data?.order?.id,
      category: "Parcel",
    }));

    const postItemsResponse = await postOrderItems(updatedOrderItems);

    if (!postItemsResponse?.length) {
      throw new ApiError(500, "Failed to add order items inside Europe.");
    }
  } else {
    const updatedOrderOutsideItems = order_outside_items.map((item) => ({
      ...item,
      order_id: data?.order?.id,
    }));

    const postOutsideItemsResponse = await postOrderOutsideItems(
      updatedOrderOutsideItems
    );

    if (!postOutsideItemsResponse?.length) {
      throw new ApiError(500, "Failed to add order items outside Europe.");
    }
  }

  // Return success response
  return res
    .status(201)
    .json(
      new ApiResponse(201, data, "Order placed successfully, and items added!")
    );
});

const deleteAnOrder = asyncHandler(async (req, res, next) => {
  const { orderId } = req.query;
  if (!orderId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Order ID is required."));
  }

  const response = await removeAnOrder(orderId);

  return res.status(200).json(new ApiResponse(200, null, response?.message));
});
const getTodayOrders = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const orders = await getOrdersByCollectionDate(today);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const orderMarkup = asyncHandler(async (req, res, next) => {
  const { id, markup } = req.body;

  // Create the user
  const data = await addMarkUp(id, markup);

  return res
    .status(201)
    .json(
      new ApiResponse(201, data, "Markup for the order is added successfully!")
    );
});
const fetchOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Order ID is required."));
  }
  const order = await getOrderById(id);

  if (!order) {
    throw new ApiError(404, `Order with ID ${id} not found.`);
  }

  // Return success response
  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully!"));
});

const updateOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { customer_details, delivery_details, billing_details } = req.body;

  // Check if the order ID is provided
  if (!id) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Order ID is required."));
  }

  // Validate that at least one of the fields is provided for update
  if (!customer_details && !delivery_details && !billing_details) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "At least one field to update is required.")
      );
  }

  // Prepare the SQL query to update the order details
  const updateFields = [];
  const updateValues = [];

  if (customer_details) {
    updateFields.push("customer_details = ?");
    updateValues.push(JSON.stringify(customer_details)); // Convert object to JSON string
  }
  if (delivery_details) {
    updateFields.push("delivery_details = ?");
    updateValues.push(JSON.stringify(delivery_details));
  }
  if (billing_details) {
    updateFields.push("billing_details = ?");
    updateValues.push(JSON.stringify(billing_details));
  }

  // Add the order ID as the last parameter for the WHERE clause
  updateValues.push(id);

  const updateQuery = `
    UPDATE orders
    SET ${updateFields.join(", ")}
    WHERE id = ?
  `;

  try {
    // Execute the update query
    const [result] = await db.query(updateQuery, updateValues);

    // Check if any row was updated
    if (result.affectedRows === 0) {
      throw new ApiError(404, `Order with ID ${id} not found.`);
    }

    // Return the success response
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Order updated successfully!"));
  } catch (error) {
    console.error("Error updating order:", error);
    throw new ApiError(
      500,
      "Database error occurred while updating the order."
    );
  }
});

const updateIsCustomStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.query; // Order ID is passed in the query parameters

  if (!id) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Order ID is required."));
  }

  // Call the model function to update the is_custom column
  const result = await updateIsCustom(id);

  if (result.affectedRows === 0) {
    throw new ApiError(404, `Order with ID ${id} not found.`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "Order's is_custom status updated successfully!"
      )
    );
});
const fetchAllOrdersEasyShip = asyncHandler(async (req, res, next) => {
  let allRecords = [];
  let currentPage = 1;
  let hasMoreData = true;
  const apiUrl = "https://api.easyship.com/2023-01/shipments";
  const token = process.env.EASYSHIP_API_TOKEN;

  try {
    while (hasMoreData) {
      const response = await fetch(
        `${apiUrl}?page=${currentPage}&per_page=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      allRecords = [...allRecords, ...data.shipments];
      if (data.shipments.length < 100) {
        hasMoreData = false;
      } else {
        currentPage++;
      }
    }
    return res.status(200).json({
      status: 200,
      data: allRecords,
      message: "All orders are fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching Easyship orders:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch Easyship orders",
      error: error.message,
    });
  }
});
const compareAndCreateOrders = asyncHandler(async (req, res, next) => {
  const ordersArray = req.body.orders;
  if (!Array.isArray(ordersArray) || ordersArray.length === 0) {
    throw new ApiError(400, "Invalid data. An array of orders is required.");
  }

  // Get existing orders with both easyship_shipment_id and pickup_state
  const [existingOrders] = await db.query(
    `SELECT id, easyship_shipment_id, pickup_state, status FROM orders`
  );

  // Create a map for faster lookup with both shipment_id and pickup_state
  const existingOrdersMap = new Map();
  existingOrders.forEach((order) => {
    existingOrdersMap.set(order.easyship_shipment_id, {
      id: order.id,
      pickup_state: order.pickup_state,
      status: order.status
    });
  });

  const ordersToCreate = [];
  const ordersToUpdate = [];
  const existingOrdersDetails = [];

ordersArray.forEach((order) => {
  const existingOrder = existingOrdersMap.get(order.easyship_shipment_id);

  if (existingOrder) {
    console.log(existingOrder, "ORDER EXIST AND PDATE")
    const shouldUpdatePickup =
      existingOrder.pickup_state !== order.pickup_state;
    const shouldUpdateDelivery =
      existingOrder.pickup_state === order.pickup_state &&
      existingOrder.status !== order.delivery_state;
;

    if (shouldUpdatePickup || shouldUpdateDelivery) {
      // Update if pickup_state OR delivery_state changed
      ordersToUpdate.push({
        id: existingOrder.id,
        pickup_state: order.pickup_state,
        status: order.delivery_state,
        orderData: order,
      });
    } else {
      existingOrdersDetails.push(order);
    }
  } else {
    // New order
    ordersToCreate.push(order);
  }
});


  // Update existing orders with changed pickup_state
  const updatedOrders = [];
  for (const orderToUpdate of ordersToUpdate) {
    try {
      const [updateResult] = await db.query(
        `UPDATE orders SET pickup_state = ?, status = ? WHERE id = ?`,
        [
          orderToUpdate.pickup_state,
          orderToUpdate.status,
          orderToUpdate.id,
        ]
      );


      if (updateResult.affectedRows > 0) {
        updatedOrders.push({
          id: orderToUpdate.id,
          easyship_shipment_id: orderToUpdate.orderData.easyship_shipment_id,
          pickup_state: orderToUpdate.pickup_state,
          status: orderToUpdate.status,
          updated: true,
        });
      }
    } catch (error) {
      console.error(
        `Failed to update order with ID ${orderToUpdate.id}:`,
        error
      );
      throw new ApiError(
        500,
        `Failed to update order with ID ${orderToUpdate.id}`
      );
    }
  }

  // Create new orders for those not found in the existing database
  const createdOrders = [];
  for (const newOrder of ordersToCreate) {
    const data = await createOrder(
      "smudasser36@gmail.com",
      "MD",
      "admin",
      newOrder.origin_address,
      newOrder.destination_address,
      newOrder.return_address,
      newOrder.delivery_state,
      newOrder.markup,
      newOrder.tracking_page_url,
      newOrder.pickup_state,
      newOrder.easyship_shipment_id,
      newOrder.delivery_state,
      newOrder,
      newOrder.custom_order_number
    );

    if (!data?.order?.id) {
      throw new ApiError(400, "Failed to create new order.");
    }

    createdOrders.push(data.order);
  }

  // Return a response with the details of existing, updated, and created orders
  return res.status(200).json({
    message: "Orders processed successfully.",
    existingOrders: existingOrdersDetails,
    updatedOrders: updatedOrders,
    createdOrders: createdOrders,
  });
});
// const compareAndCreateOrders = asyncHandler(async (req, res, next) => {
//   const ordersArray = req.body.orders;
//   if (!Array.isArray(ordersArray) || ordersArray.length === 0) {
//     throw new ApiError(400, "Invalid data. An array of orders is required.");
//   }

//   // Get existing orders with all fields we want to compare
//   const [existingOrders] = await db.query(
//     `SELECT id, easyship_shipment_id, pickup_state, delivery_state, tracking_page_url, status FROM orders`
//   );

//   // Create a map for faster lookup with all comparison fields
//   const existingOrdersMap = new Map();
//   existingOrders.forEach((order) => {
//     existingOrdersMap.set(order.easyship_shipment_id, {
//       id: order.id,
//       pickup_state: order.pickup_state,
//       delivery_state: order.delivery_state,
//       tracking_page_url: order.tracking_page_url,
//       status: order.status,
//     });
//   });

//   const ordersToCreate = [];
//   const ordersToUpdate = [];
//   const existingOrdersDetails = [];

//   ordersArray.forEach((order) => {
//     const existingOrder = existingOrdersMap.get(order.easyship_shipment_id);

//     if (existingOrder) {
//       // Order exists, check if any of the tracked fields have changed
//       const fieldsChanged =
//         existingOrder.pickup_state !== order.pickup_state ||
//         existingOrder.delivery_state !== order.delivery_state ||
//         existingOrder.tracking_page_url !== order.tracking_page_url ||
//         existingOrder.status !== order.status;

//       if (fieldsChanged) {
//         // One or more fields have changed, update the existing order
//         ordersToUpdate.push({
//           id: existingOrder.id,
//           pickup_state: order.pickup_state,
//           delivery_state: order.delivery_state,
//           courier: order.courier,
//           tracking_page_url: order.tracking_page_url,
//           status: order.status,
//           orderData: order,
//         });
//       } else {
//         // Order exists and all tracked fields are the same, no need to update
//         existingOrdersDetails.push(order);
//       }
//     } else {
//       // New order (easyship_shipment_id doesn't exist)
//       ordersToCreate.push(order);
//     }
//   });

//   // Update existing orders with changed fields
//   const updatedOrders = [];
//   for (const orderToUpdate of ordersToUpdate) {
//     try {
//       const [updateResult] = await db.query(
//         `UPDATE orders SET pickup_state = ?, delivery_state = ?, tracking_page_url = ?, status = ? WHERE id = ?`,
//         [
//           orderToUpdate.pickup_state,
//           orderToUpdate.delivery_state,
//           orderToUpdate.tracking_page_url,
//           orderToUpdate.status,
//           orderToUpdate.id,
//         ]
//       );

//       if (updateResult.affectedRows > 0) {
//         updatedOrders.push({
//           id: orderToUpdate.id,
//           easyship_shipment_id: orderToUpdate.orderData.easyship_shipment_id,
//           pickup_state: orderToUpdate.pickup_state,
//           delivery_state: orderToUpdate.delivery_state,
//           tracking_page_url: orderToUpdate.tracking_page_url,
//           status: orderToUpdate.status,
//           updated: true,
//         });
//       }
//     } catch (error) {
//       console.error(
//         `Failed to update order with ID ${orderToUpdate.id}:`,
//         error
//       );
//       throw new ApiError(
//         500,
//         `Failed to update order with ID ${orderToUpdate.id}`
//       );
//     }
//   }

//   // Create new orders for those not found in the existing database
//   const createdOrders = [];
//   for (const newOrder of ordersToCreate) {
//     const data = await createOrder(
//       "smudasser36@gmail.com",
//       "MD",
//       "admin",
//       newOrder.origin_address,
//       newOrder.destination_address,
//       newOrder.return_address,
//       newOrder.status, // Use status from incoming order
//       newOrder.markup,
//       newOrder.tracking_page_url,
//       newOrder.pickup_state,
//       newOrder.easyship_shipment_id,
//       newOrder.delivery_state,
//       newOrder,
//       newOrder.custom_order_number
//     );

//     if (!data?.order?.id) {
//       throw new ApiError(400, "Failed to create new order.");
//     }

//     createdOrders.push(data.order);
//   }

//   // Return a response with the details of existing, updated, and created orders
//   return res.status(200).json({
//     message: "Orders processed successfully.",
//     existingOrders: existingOrdersDetails,
//     updatedOrders: updatedOrders,
//     createdOrders: createdOrders,
//   });
// });
const processOrders = asyncHandler(async (req, res, next) => {
  let allRecords = [];
  let hasMoreData = true;
  const [settings] = await db.query(
    `SELECT current_page FROM settings LIMIT 1`
  );
  let currentPage = settings.length > 0 ? settings[0].current_page : 1;
  const existingOrdersDetails = [];
  const ordersToCreate = [];
  const apiUrl = "https://api.easyship.com/2023-01/shipments";
  const token = process.env.EASYSHIP_API_TOKEN;
  try {
    while (hasMoreData) {
      const response = await fetch(
        `${apiUrl}?page=${currentPage}&per_page=100`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      allRecords = [...allRecords, ...data.shipments];
      if (data.shipments.length < 100) {
        hasMoreData = false;
        await db.query(`UPDATE settings SET current_page = 1`);
        return;
      } else {
        currentPage++;
      }

      const [existingOrders] = await db.query(
        `SELECT easyship_shipment_id FROM orders`
      );
      const existingShipmentIds = existingOrders.map(
        (order) => order.easyship_shipment_id
      );
      for (const order of data.shipments) {
        if (existingShipmentIds.includes(order.easyship_shipment_id)) {
          await db.query(
            `UPDATE orders SET meta_data = ? WHERE easyship_shipment_id = ?`,
            [JSON.stringify(order), order.easyship_shipment_id]
          );
          existingOrdersDetails.push(order);
        } else {
          const newOrder = await createOrder(
            "admin@gmail.com",
            "MD",
            "admin",
            order.origin_address,
            order.destination_address,
            order.return_address,
            "status",
            order.markup,
            order.tracking_page_url,
            order.pickup_state,
            order.easyship_shipment_id,
            order.delivery_state,
            order,
            order.custom_order_number
          );
          if (!newOrder?.order?.id) {
            throw new ApiError(400, "Failed to create new order.");
          }

          ordersToCreate.push(newOrder.order);
        }
      }

      await db.query(`UPDATE settings SET current_page = ?`, [currentPage]);
    }

    return res.status(200).json({
      message: "Orders processed successfully.",
      existingOrders: existingOrdersDetails,
      createdOrders: ordersToCreate,
    });
  } catch (error) {
    console.error("Error processing orders:", error.message);
    return res.status(500).json({
      status: 500,
      message: "Failed to process Easyship orders",
      error: error.message,
    });
  }
});
const updateRawData = asyncHandler(async (req, res, next) => {
  const { orderId, rawData } = req.body;

  if (!orderId) {
    return res.status(400).json(new ApiError(400, "Order ID is required"));
  }

  if (!rawData) {
    return res.status(400).json(new ApiError(400, "Raw data is required"));
  }

  try {
    const [result] = await db.query(
      `UPDATE \`orders\` 
       SET raw_data = ? 
       WHERE id = ?`,
      [JSON.stringify(rawData), orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { orderId, rawData },
          "Raw data updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating raw data:", error);
    return res.status(500).json(new ApiError(500, "Failed to update raw data"));
  }
});
const getOrdersByCollectionDate = async (date) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE collection_date = ?`,
      [date]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching orders by collection date:", error);
    throw new ApiError(500, "Database query failed");
  }
};
module.exports = {
  fetchAllOrders,
  postOrder,
  deleteAnOrder,
  orderMarkup,
  fetchOrderById,
  updateOrder,
  updateIsCustomStatus,
  fetchFilteredOrders,
  fetchOrdersWithPickupState,
  fetchCustomOrders,
  fetchAllOrdersEasyShip,
  compareAndCreateOrders,
  processOrders,
  updateCourier,
  updateTrackingUrl,
  fetchOrdersByUser,
  updateCustomRemarks,
  updateReason,
  updateTrackingNum,
  updateRawData,
  updateCollectionDate,
  updateOrderStatus,
  updateAddresses,
  updateCollectionDateOrStatus,
  getTodayOrders,
};
