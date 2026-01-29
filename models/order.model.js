const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");
const { createUser } = require("./user.model");
const { DateTime } = require("luxon");
//model
const createOrder = async (
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
) => {
  try {
    if (!email || !username || !role || !status) {
      throw new Error(
        "Missing required fields: email, username, role, or status."
      );
    }

    const dublinTime = DateTime.now()
      .setZone("Europe/Dublin")
      .toFormat("yyyy-MM-dd HH:mm:ss");

    let collection_date = collection_date_payload
      ? DateTime.fromISO(collection_date_payload, { zone: "Europe/Dublin" })
      : DateTime.now().setZone("Europe/Dublin");

    const orderHour = collection_date.hour;
    const orderMinute = collection_date.minute;

    if (collectionOption === 1) {
      if (orderHour >= 16 || (orderHour === 15 && orderMinute >= 59)) {
        collection_date = collection_date.plus({ days: 4 });
      } else {
        collection_date = collection_date.plus({ days: 2 });
      }
    } else if (collectionOption === 2) {
      if (orderHour < 14) {
      } else {
        collection_date = collection_date.plus({ days: 1 });
      }
    }

    while (collection_date.weekday === 6 || collection_date.weekday === 7) {
      collection_date = collection_date.plus({ days: 1 });
    }

    const formattedCollectionDate = collection_date.toFormat("yyyy-MM-dd");
    const raw_data = {
      order_items: order_items,
      order_outside_items: order_outside_items,
    };
    const [result] = await db.query(
      `INSERT INTO orders 
        (email, sender_email, username, role, customer_details, delivery_details, billing_details, status, markup, tracking_page_url, custom_tracking_url, custom_remarks, custom_shipping_label, shipping_reason, custom_tracking_number, pickup_state, easyship_shipment_id, delivery_state, meta_data, custom_order_number, created_at, collection_address, collection_date, notes, payment, boxes_data,raw_data, total_price, upload_doc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        email,
        username,
        role,
        JSON.stringify(customer_details),
        JSON.stringify(delivery_details),
        JSON.stringify(billing_details),
        status,
        markup,
        tracking_page_url,
        "", // Default empty string for custom_tracking_url
        "", // Default empty string for custom_remarks
        "", // Default empty string for custom_shipping_label
        "", // Default empty string for shipping_reason
        "", // Default empty string for custom_tracking_number
        pickup_state,
        easyship_shipment_id,
        delivery_state,
        JSON.stringify(meta_data),
        custom_order_number,
        dublinTime,
        collection_address,
        formattedCollectionDate,
        notes,
        payment,
        JSON.stringify(boxes_data),
        JSON.stringify(raw_data),
        total_price,
        upload_doc,
      ]
    );

    // Retrieve the inserted row
    const [insertedRows] = await db.query(`SELECT * FROM orders WHERE id = ?`, [
      result.insertId,
    ]);

    if (insertedRows.length === 0) {
      throw new Error("Failed to retrieve the inserted order.");
    }

    const insertedRow = insertedRows[0];

    // if (role === "admin") {
    //   const newUser = await createUser(username, email, "password", "user");
    //   return {
    //     order: insertedRow,
    //     newUser,
    //     collection_date: formattedCollectionDate,
    //     collectionOption: collectionOption,
    //   };
    // }

    return {
      order: insertedRow,
      collection_date: formattedCollectionDate,
      collectionOption: collectionOption,
    };
  } catch (error) {
    console.error("ERROR LINE======= Database error:", error.message);
    throw new ApiError(400, error.message, [error]);
  }
};

// const getAllOrders = async () => {
//   try {
//     const [orders] = await db.query(`
//           SELECT 
//               o.id,
//               o.email,
//               o.username,
//               o.role,
//               o.status,
//               o.markup,
//               o.easyship_shipment_id,
//               o.meta_data,
//               o.custom_order_number,
//               SUM(oi.price) AS total_price
//           FROM 
//               \`orders\` AS o
//           INNER JOIN 
//               order_items AS oi
//           ON 
//               o.id = oi.order_id
//           GROUP BY 
//               o.id
  
//           UNION ALL
  
//           SELECT 
//               o.id,
//               o.email,
//               o.username,
//               o.role,
//               o.status,
//               o.markup,
//               o.easyship_shipment_id,
//               o.meta_data,
//               o.custom_order_number,
//               SUM(ooi.price) AS total_price
//           FROM 
//               \`orders\` AS o
//           INNER JOIN 
//               order_outside_items AS ooi
//           ON 
//               o.id = ooi.order_id
//           GROUP BY 
//               o.id
  
//           ORDER BY 
//               id DESC
//       `);

//     return orders;
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     throw new ApiError(500, "Database error occurred while retrieving orders.");
//   }
// };
// const getAllOrders = async () => {
//   try {
//     const [orders] = await db.query(`
//         SELECT 
//             o.id,
//             o.email,
//             o.username,
//             o.role,
//             o.status,
//             o.markup,
//             o.easyship_shipment_id,
//             o.meta_data,
//             o.custom_order_number,
//             o.is_custom,
//             o.pickup_state AS pickupState,
//             o.total_price
//         FROM 
//             \`orders\` AS o
//         LEFT JOIN 
//             order_items AS oi ON o.id = oi.order_id
//         LEFT JOIN 
//             order_outside_items AS ooi ON o.id = ooi.order_id
//         GROUP BY 
//             o.id, o.email, o.username, o.role, o.status, o.markup, 
//             o.easyship_shipment_id, o.meta_data, o.custom_order_number
//         ORDER BY 
//             o.id DESC
//     `);

//     return orders;
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     throw new ApiError(500, "Database error occurred while retrieving orders.");
//   }
// };
const getAllOrders = async () => {
  try {
    const [orders] = await db.query(`
        SELECT 
            o.id,
            o.email,
            o.username,
            o.role,
            o.status,
            o.markup,
            o.easyship_shipment_id,
            o.meta_data,
            o.custom_order_number,
            o.is_custom,
            o.total_price,
            o.pickup_state AS pickupState,
            o.upload_doc
        FROM 
            \`orders\` AS o
        LEFT JOIN 
            order_items AS oi ON o.id = oi.order_id
        LEFT JOIN 
            order_outside_items AS ooi ON o.id = ooi.order_id
        GROUP BY 
            o.id, o.email, o.username, o.role, o.status, o.markup, 
            o.easyship_shipment_id, o.meta_data, o.custom_order_number, 
            o.is_custom, o.total_price, o.pickup_state, o.upload_doc
        ORDER BY 
            o.id DESC
    `);

    return orders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new ApiError(500, "Database error occurred while retrieving orders.");
  }
};

const getAllOrdersByEmail = async (email) => {
  try {
    const [orders] = await db.query(
      `
      SELECT 
          o.id,
          o.status,
          o.created_at,
          o.easyship_shipment_id,
          o.custom_order_number,
          o.collection_date,
          o.custom_shipping_label,
          o.is_custom,
          o.pickup_state,
          o.customer_details,
          o.delivery_details,
          o.billing_details,
          o.markup,
          o.raw_data,
          o.collection_address,
          o.notes,
          o.payment,
          o.boxes_data,
          o.upload_doc,
          SUM(oi.price) AS total_price
      FROM 
          \`orders\` AS o
      INNER JOIN 
          order_items AS oi
      ON 
          o.id = oi.order_id
      WHERE 
          o.email = ?
      GROUP BY 
          o.id

      UNION ALL

      SELECT 
          o.id,
          o.status,                    
          o.created_at,
          o.easyship_shipment_id,
          o.custom_order_number,
          o.collection_date,
          o.custom_shipping_label,
          o.is_custom,
          o.pickup_state,
          o.customer_details,
          o.delivery_details,
          o.billing_details,
          o.markup,
          o.raw_data,
          o.collection_address,
          o.notes,
          o.payment,
          o.boxes_data,
          o.upload_doc,
          SUM(ooi.price) AS total_price
      FROM 
          \`orders\` AS o
      INNER JOIN 
          order_outside_items AS ooi
      ON 
          o.id = ooi.order_id
      WHERE 
          o.email = ?
      GROUP BY 
          o.id

      ORDER BY 
          id DESC
      `,
      [email, email]
    );

    return orders;
  } catch (error) {
    console.error("Error fetching orders by email:", error);
    throw new ApiError(500, "Database error occurred while retrieving orders.");
  }
};

const getFilteredOrders = async (page = 1, limit = 10) => {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // First query to get total count
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total_count
      FROM \`orders\` AS o
      WHERE 
          o.is_custom = 0 
          AND o.pickup_state = 'not_requested'
    `);

    const totalRecords = countResult[0].total_count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Second query to get paginated orders
    const [orders] = await db.query(
      `
      SELECT 
          o.id,
          o.email,
          o.username,
          o.role,
          o.status,
          o.markup,
          o.easyship_shipment_id,
          o.meta_data,
          o.custom_order_number,
          o.custom_remarks,
          o.boxes_data,
          o.collection_date,
          o.created_at,
          o.total_price,
          o.upload_doc
      FROM 
          \`orders\` AS o
      WHERE 
          o.is_custom = 0 
          AND o.pickup_state = 'not_requested'
      ORDER BY 
          o.id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    // Return paginated response
    return {
      orders,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: totalRecords,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
        next_page: page < totalPages ? page + 1 : null,
        previous_page: page > 1 ? page - 1 : null,
      },
    };
  } catch (error) {
    console.error("Error fetching filtered orders:", error);
    throw new ApiError(
      500,
      "Database error occurred while retrieving filtered orders."
    );
  }
};

const getOrdersWithPickupState = async (page = 1, limit = 10) => {
  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // First query to get total count
    const [countResult] = await db.query(`
      SELECT COUNT(DISTINCT o.id) as total_count
      FROM \`orders\` AS o
      LEFT JOIN order_items AS oi ON o.id = oi.order_id
      LEFT JOIN order_outside_items AS ooi ON o.id = ooi.order_id
      WHERE o.pickup_state != 'not_requested'
    `);

    const totalRecords = countResult[0].total_count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Second query to get paginated orders
    const [orders] = await db.query(
      `
      SELECT 
          o.id,
          o.email,
          o.username,
          o.role,
          o.status,
          o.markup,
          o.easyship_shipment_id,
          o.meta_data,
          o.pickup_state AS pickupState, 
          o.custom_order_number,
          o.custom_remarks,
          o.created_at,
          o.upload_doc,
          SUM(COALESCE(oi.price, 0) + COALESCE(ooi.price, 0)) AS total_price
      FROM 
          \`orders\` AS o
      LEFT JOIN 
          order_items AS oi ON o.id = oi.order_id
      LEFT JOIN 
          order_outside_items AS ooi ON o.id = ooi.order_id
      WHERE 
          o.pickup_state != 'not_requested'
      GROUP BY 
          o.id, o.email, o.username, o.role, o.status, o.markup, 
          o.easyship_shipment_id, o.meta_data, o.pickup_state, 
          o.custom_order_number, o.custom_remarks, o.created_at, o.upload_doc
      ORDER BY 
          o.id DESC
      LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    // Return paginated response
    return {
      orders,
      pagination: {
        current_page: page,
        per_page: limit,
        total_records: totalRecords,
        total_pages: totalPages,
        has_next_page: page < totalPages,
        has_previous_page: page > 1,
        next_page: page < totalPages ? page + 1 : null,
        previous_page: page > 1 ? page - 1 : null,
      },
    };
  } catch (error) {
    console.error("Error fetching orders excluding 'not_requested':", error);
    throw new ApiError(500, "Database error occurred while retrieving orders.");
  }
};
const getCustomOrders = async () => {
  try {
    const [orders] = await db.query(`
      SELECT 
          o.id,
          o.email,
          o.username,
          o.role,
          o.status,
          o.markup,
          o.easyship_shipment_id,
          o.meta_data,
          o.is_custom,
          o.custom_order_number,
          o.custom_tracking_url,
          o.custom_remarks,
          o.custom_shipping_label,
          o.shipping_reason,
          o.custom_tracking_number,
          o.boxes_data,
          o.customer_details,
          o.delivery_details,
          o.billing_details,
          o.raw_data,
          o.collection_date,
          o.upload_doc,
          o.total_price AS Total,
          SUM(oi.price) AS total_price
      FROM 
          \`orders\` AS o
      INNER JOIN 
          order_items AS oi
      ON 
          o.id = oi.order_id
      WHERE 
          o.is_custom = 1
      GROUP BY 
          o.id

      UNION ALL

      SELECT 
          o.id,
          o.email,
          o.username,
          o.role,
          o.status,
          o.markup,
          o.easyship_shipment_id,
          o.meta_data,
          o.is_custom,
          o.custom_order_number,
          o.custom_tracking_url,
          o.custom_remarks,
          o.custom_shipping_label,
          o.shipping_reason,
          o.custom_tracking_number,
          o.boxes_data,
          o.customer_details,
          o.delivery_details,
          o.billing_details,
          o.raw_data,
          o.collection_date,
          o.upload_doc,
          o.total_price AS Total,
          SUM(ooi.price) AS total_price
      FROM 
          \`orders\` AS o
      INNER JOIN 
          order_outside_items AS ooi
      ON 
          o.id = ooi.order_id
      WHERE 
          o.is_custom = 1
      GROUP BY 
          o.id
      ORDER BY 
          id DESC
    `);
    return orders;
  } catch (error) {
    console.error("Error fetching custom orders:", error);
    throw new ApiError(
      500,
      "Database error occurred while retrieving custom orders."
    );
  }
};

const updateCourierInOrder = async (orderId, courierName) => {
  try {
    // Ensure meta_data is not null before updating
    const [checkMetaData] = await db.query(
      `SELECT meta_data FROM orders WHERE id = ?`,
      [orderId]
    );

    if (checkMetaData.length === 0) {
      throw new ApiError(404, "Order not found.");
    }

    let metaData = checkMetaData[0].meta_data || "{}";
    if (typeof metaData === "string") {
      metaData = JSON.parse(metaData);
    }

    // Update the courier name inside the meta_data field
    metaData.courier = courierName;
    const updatedMetaData = JSON.stringify(metaData);
    const [result] = await db.query(
      `UPDATE orders 
       SET meta_data = ? 
       WHERE id = ?`,
      [updatedMetaData, orderId]
    );

    if (result.affectedRows === 0) {
      throw new ApiError(404, "Order not found or no update performed.");
    }

    return { success: true, message: "Courier updated successfully" };
  } catch (error) {
    console.error("Error updating courier:", error);
    throw new ApiError(500, "Database error occurred while updating courier.");
  }
};
const removeAnOrder = async (orderId) => {
  try {
    const [checkOrder] = await db.query(`SELECT id FROM orders WHERE id = ?`, [
      orderId,
    ]);

    if (checkOrder.length === 0) {
      throw new ApiError(404, "Order not found.");
    }

    // Delete related items first
    const [deleteOrderItems] = await db.query(
      "DELETE FROM order_items WHERE order_id = ?",
      [orderId]
    );

    const [deleteOutsideItems] = await db.query(
      "DELETE FROM order_outside_items WHERE order_id = ?",
      [orderId]
    );

    // Delete the order itself
    const [deleteResult] = await db.query("DELETE FROM orders WHERE id = ?", [
      orderId,
    ]);

    if (deleteResult.affectedRows === 0) {
      throw new ApiError(404, "Order deletion failed.");
    }

    return {
      success: true,
      message: "Order and related items deleted successfully.",
    };
  } catch (error) {
    console.error("Error deleting the order:", error);
    throw new ApiError(
      500,
      "Database error occurred while deleting the order."
    );
  }
};

const addMarkUp = async (id, markup) => {
  try {
    if (!id || !markup) {
      throw new Error("Both id and markup are required.");
    }

    let mysqlQuery = `
    UPDATE orders
    SET 
      markup = ? 
    WHERE id = ?
  `;

    await db.query(mysqlQuery, [markup, id]);

    const selectQuery = `
      SELECT 
        id,
        username,
        ship_from,
        ship_to,
        parcel,
        markup,
        (price + markup) AS price
      FROM orders
      WHERE id = ?
    `;

    const [updatedOrder] = await db.query(selectQuery, [id]);

    return updatedOrder[0];
  } catch (error) {
    console.error("Error added markup order:", error);
    throw new ApiError(
      500,
      "Database error occurred while adding markup to the order."
    );
  }
};
const getOrderById = async (id) => {
  try {
    if (!id) {
      throw new Error("Order ID is required.");
    }

    const [orderRows] = await db.query(
      `
      SELECT 
        o.id,
        o.email,
        o.username,
        o.role,
        o.status,
        o.upload_doc,
        o.customer_details,
        o.delivery_details,
        o.billing_details,
        oi.id AS order_item_id,
        oi.ship_from AS order_item_ship_from,
        oi.ship_to AS order_item_ship_to,
        oi.category AS order_item_category,
        oi.quantity AS order_item_quantity,
        oi.price AS order_item_price,
        ooi.id AS outside_item_id,
        ooi.ship_from AS outside_item_ship_from,
        ooi.ship_to AS outside_item_ship_to,
        ooi.category AS outside_item_category,
        ooi.quantity AS outside_item_quantity,
        ooi.price AS outside_item_price,
        ooi.box_name,
        ooi.length,
        ooi.width,
        ooi.height,
        ooi.weight,
        ooi.sku,
        ooi.currency,
        ooi.description,
        ooi.hs_code
      FROM orders AS o
      LEFT JOIN order_items AS oi ON o.id = oi.order_id
      LEFT JOIN order_outside_items AS ooi ON o.id = ooi.order_id
      WHERE o.id = ?
    `,
      [id]
    );

    if (orderRows.length === 0) {
      throw new ApiError(404, `Order with ID ${id} not found.`);
    }

    const order = orderRows[0];

    const result = {
      id: order.id,
      email: order.email,
      username: order.username,
      upload_doc: order.upload_doc,
      role: order.role,
      status: order.status,
      customer_details: JSON.parse(order.customer_details),
      delivery_details: JSON.parse(order.delivery_details),
      billing_details: JSON.parse(order.billing_details),
    };
    const orderItems = orderRows.filter((row) => row.order_item_id);
    if (orderItems.length > 0) {
      result.order_items = orderItems.map((item) => ({
        id: item.order_item_id,
        ship_from: item.order_item_ship_from,
        ship_to: item.order_item_ship_to,
        category: item.order_item_category,
        quantity: item.order_item_quantity,
        price: item.order_item_price,
        markup: item.order_item_markup,
      }));
    }
    const outsideItems = orderRows.filter((row) => row.outside_item_id);
    if (outsideItems.length > 0) {
      result.order_outside_items = outsideItems.map((item) => ({
        id: item.outside_item_id,
        ship_from: item.outside_item_ship_from,
        ship_to: item.outside_item_ship_to,
        category: item.outside_item_category,
        quantity: item.outside_item_quantity,
        price: item.outside_item_price,
        markup: item.outside_item_markup,
        box_name: item.box_name,
        length: item.length,
        width: item.width,
        height: item.height,
        weight: item.weight,
        sku: item.sku,
        currency: item.currency,
        description: item.description,
        hs_code: item.hs_code,
      }));
    }

    return { order: result };
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    throw new ApiError(
      500,
      "Database error occurred while retrieving the order."
    );
  }
};
const updateIsCustom = async (orderId) => {
  const query = `UPDATE orders SET is_custom = 1 WHERE id = ?`;
  const values = [orderId];

  try {
    const [result] = await db.query(query, values);
    return result;
  } catch (error) {
    throw new Error("Error updating is_custom column");
  }
};
module.exports = {
  createOrder,
  removeAnOrder,
  getAllOrders,
  addMarkUp,
  getOrderById,
  updateIsCustom,
  getFilteredOrders,
  getOrdersWithPickupState,
  getCustomOrders,
  updateCourierInOrder,
  getAllOrdersByEmail,
};
