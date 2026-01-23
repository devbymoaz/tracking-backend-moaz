// Model updates for update and delete functionality

const { db } = require("../db");
const { ApiError } = require("../utils/ApiError");

const ensureAmazonPricesTable = async () => {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS amazon_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        display_name VARCHAR(255) NOT NULL,
        country VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL
      )
    `;
    await db.query(createSql);
  } catch (error) {
    console.error("Error ensuring amazon_prices table:", error);
    throw new ApiError(
      500,
      "Database error occurred while ensuring amazon_prices table."
    );
  }
};

const ensureAmazonCountryPricesTable = async () => {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS amazon_country_prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        type ENUM('sender', 'receiver') NOT NULL DEFAULT 'receiver'
      )
    `;
    await db.query(createSql);
  } catch (error) {
    console.error("Error ensuring amazon_country_prices table:", error);
    throw new ApiError(
      500,
      "Database error occurred while ensuring amazon_country_prices table."
    );
  }
};

const ensureAmazonAddressesTable = async () => {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS amazon_addresses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        display_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        street_address VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        postcode VARCHAR(50) NOT NULL,
        country VARCHAR(100) NOT NULL
      )
    `;
    await db.query(createSql);
  } catch (error) {
    console.error("Error ensuring amazon_addresses table:", error);
    throw new ApiError(
      500,
      "Database error occurred while ensuring amazon_addresses table."
    );
  }
};

const createDetailsModel = async (details, user_id, type) => {
  try {
    const mysqlQuery =
      type === "receiver"
        ? `INSERT INTO receiver_details (receiver_details, user_id) VALUES (?, ?)`
        : `INSERT INTO sender_details (sender_details, user_id) VALUES (?, ?)`;

    const [result] = await db.query(mysqlQuery, [
      JSON.stringify(details),
      user_id,
    ]);

    return {
      id: result.insertId,
      details,
      user_id,
    };
  } catch (error) {
    console.error("Error inserting address box:", error);
    throw new ApiError(
      500,
      "Database error occurred while inserting address box."
    );
  }
};

const updateDetailsModel = async (id, details, type) => {
  try {
    const mysqlQuery =
      type === "receiver"
        ? `UPDATE receiver_details SET receiver_details = ? WHERE id = ?`
        : `UPDATE sender_details SET sender_details = ? WHERE id = ?`;

    const [result] = await db.query(mysqlQuery, [JSON.stringify(details), id]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, `No ${type} details found with this ID.`);
    }

    return {
      id,
      details,
      updated: true,
    };
  } catch (error) {
    console.error(`Error updating ${type} details:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      `Database error occurred while updating ${type} details.`
    );
  }
};

const deleteDetailsModel = async (id, type) => {
  try {
    const mysqlQuery =
      type === "receiver"
        ? `DELETE FROM receiver_details WHERE id = ?`
        : `DELETE FROM sender_details WHERE id = ?`;

    const [result] = await db.query(mysqlQuery, [id]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, `No ${type} details found with this ID.`);
    }

    return {
      id,
      deleted: true,
    };
  } catch (error) {
    console.error(`Error deleting ${type} details:`, error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      `Database error occurred while deleting ${type} details.`
    );
  }
};


const checkExistingSender = async (sender, user_id) => {
  try {
    const query = `SELECT * FROM sender_details WHERE sender = ? AND user_id = ? LIMIT 1`;
    const [rows] = await db.query(query, [sender, user_id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error checking sender existence:", error);
    throw new ApiError(
      500,
      "Database error occurred while checking sender existence."
    );
  }
};

const checkExistingdelievery = async (delivery, user_id) => {
  try {
    const query = `SELECT * FROM receiver_details WHERE delievery = ? AND user_id = ? LIMIT 1`;
    const [rows] = await db.query(query, [delivery, user_id]);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error checking delivery existence:", error);
    throw new ApiError(
      500,
      "Database error occurred while checking delivery existence."
    );
  }
};

const createDetailsModel_sender = async (details, user_id, sender) => {
  try {
    const query = `INSERT INTO sender_details (sender_details, user_id, sender) VALUES (?, ?, ?)`;
    const [result] = await db.query(query, [
      JSON.stringify(details),
      user_id,
      sender,
    ]);

    return {
      id: result.insertId,
      details,
      user_id,
      sender,
    };
  } catch (error) {
    console.error("Error inserting sender details:", error);
    throw new ApiError(
      500,
      "Database error occurred while inserting sender details."
    );
  }
};

const createDetailsModel_delievery = async (details, user_id, sender) => {
  try {
    const query = `INSERT INTO receiver_details (receiver_details, user_id, delievery) VALUES (?, ?, ?)`;
    const [result] = await db.query(query, [
      JSON.stringify(details),
      user_id,
      sender,
    ]);

    return {
      id: result.insertId,
      details,
      user_id,
      sender,
    };
  } catch (error) {
    console.error("Error inserting sender details:", error);
    throw new ApiError(
      500,
      "Database error occurred while inserting sender details."
    );
  }
};

const getSenderDetails = async () => {
  try {
    const mysqlQuery = "SELECT * FROM sender_details";

    const [rows] = await db.query(mysqlQuery);
    if (rows.length === 0) {
      return [];
    }

    // Return rows without parsing the JSON fields
    return rows;
  } catch (error) {
    console.error("Error retrieving address boxes:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching address boxes."
    );
  }
};

const getSenderDetailsById = async (id) => {
  try {
    const mysqlQuery = "SELECT * FROM sender_details WHERE id = ?"; // Use parameterized query to avoid SQL injection
    const [rows] = await db.query(mysqlQuery, [id]);

    // If no rows are found, return an empty array or handle it accordingly
    if (rows.length === 0) {
      return [];
    }

    // Return the matched row(s)
    return rows;
  } catch (error) {
    console.error("Error retrieving sender details:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching sender details."
    );
  }
};

const getReceiverDetailsById = async (id) => {
  try {
    const mysqlQuery = "SELECT * FROM receiver_details WHERE id = ?"; // Use parameterized query to avoid SQL injection
    const [rows] = await db.query(mysqlQuery, [id]);
    if (rows.length === 0) {
      return [];
    }
    return rows;
  } catch (error) {
    console.error("Error retrieving sender details:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching sender details."
    );
  }
};

const getReceiverDetails = async () => {
  try {
    const mysqlQuery = "SELECT * FROM receiver_details";
    const [rows] = await db.query(mysqlQuery);
    if (rows.length === 0) {
      return [];
    }

    return rows;
  } catch (error) {
    console.error("Error retrieving address boxes:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching address boxes."
    );
  }
};

const getAddressBoxesWithCountries = async () => {
  try {
    const mysqlQuery = "SELECT * FROM address_book";
    const [rows] = await db.query(mysqlQuery);

    if (rows.length === 0) {
      return [];
    }

    const addressBoxesWithCountries = rows.map((row) => {
      const senderDetails = JSON.parse(row.sender_details);
      const receiverDetails = JSON.parse(row.receiver_details);

      const senderCountry = senderDetails?.country || "Unknown";
      const receiverCountry = receiverDetails?.country || "Unknown";

      return {
        id: row.id,
        senderDetails,
        receiverDetails,
        senderCountry,
        receiverCountry,
      };
    });

    return addressBoxesWithCountries;
  } catch (error) {
    console.error("Error retrieving address boxes:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching address boxes."
    );
  }
};

const createAmazonAddress = async (
  display_name,
  company_name,
  street_address,
  city,
  postcode,
  country
) => {
  try {
    await ensureAmazonAddressesTable();
    const query = `INSERT INTO amazon_addresses (display_name, company_name, street_address, city, postcode, country) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(query, [
      display_name,
      company_name,
      street_address,
      city,
      postcode,
      country,
    ]);

    const [rows] = await db.query(
      "SELECT * FROM amazon_addresses WHERE id = ?",
      [result.insertId]
    );

    if (!rows.length) {
      throw new ApiError(500, "Failed to retrieve created amazon address.");
    }

    return rows[0];
  } catch (error) {
    console.error("Error inserting amazon address:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while inserting amazon address."
    );
  }
};

const updateAmazonAddress = async (
  id,
  display_name,
  company_name,
  street_address,
  city,
  postcode,
  country
) => {
  try {
    await ensureAmazonAddressesTable();
    const query = `UPDATE amazon_addresses SET display_name = ?, company_name = ?, street_address = ?, city = ?, postcode = ?, country = ? WHERE id = ?`;
    const [result] = await db.query(query, [
      display_name,
      company_name,
      street_address,
      city,
      postcode,
      country,
      id,
    ]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "No amazon address found with this ID.");
    }

    const [rows] = await db.query(
      "SELECT * FROM amazon_addresses WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      throw new ApiError(500, "Failed to retrieve updated amazon address.");
    }

    return rows[0];
  } catch (error) {
    console.error("Error updating amazon address:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while updating amazon address."
    );
  }
};

const deleteAmazonAddress = async (id) => {
  try {
    await ensureAmazonAddressesTable();
    const query = `DELETE FROM amazon_addresses WHERE id = ?`;
    const [result] = await db.query(query, [id]);

    if (result.affectedRows === 0) {
      throw new ApiError(404, "No amazon address found with this ID.");
    }

    return {
      id,
      deleted: true,
    };
  } catch (error) {
    console.error("Error deleting amazon address:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while deleting amazon address."
    );
  }
};

const getAllAmazonAddresses = async () => {
  try {
    await ensureAmazonAddressesTable();
    const [rows] = await db.query("SELECT * FROM amazon_addresses");
    return rows;
  } catch (error) {
    console.error(
      "Error retrieving amazon addresses:",
      error.message || error
    );
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon addresses."
    );
  }
};

const getAmazonAddressById = async (id) => {
  try {
    await ensureAmazonAddressesTable();
    const [rows] = await db.query(
      "SELECT * FROM amazon_addresses WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return null;
    }

    return rows[0];
  } catch (error) {
    console.error(
      "Error retrieving amazon address:",
      error.message || error
    );
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon address."
    );
  }
};

const createAmazonPrice = async (price) => {
  try {
    await ensureAmazonPricesTable();
    const query = `
      INSERT INTO amazon_prices (display_name, country, price, currency)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, ["default", "N/A", price, "USD"]);
    const [rows] = await db.query(
      "SELECT * FROM amazon_prices WHERE id = ?",
      [result.insertId]
    );
    if (!rows.length) {
      throw new ApiError(500, "Failed to retrieve created amazon price.");
    }
    return rows[0];
  } catch (error) {
    console.error("Error inserting amazon price:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while inserting amazon price."
    );
  }
};

const updateAmazonPrice = async (id, price) => {
  try {
    await ensureAmazonPricesTable();
    const query = `
      UPDATE amazon_prices
      SET price = ?
      WHERE id = ?
    `;
    const [result] = await db.query(query, [price, id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, "No amazon price found with this ID.");
    }
    const [rows] = await db.query(
      "SELECT * FROM amazon_prices WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      throw new ApiError(500, "Failed to retrieve updated amazon price.");
    }
    return rows[0];
  } catch (error) {
    console.error("Error updating amazon price:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while updating amazon price."
    );
  }
};

const deleteAmazonPrice = async (id) => {
  try {
    await ensureAmazonPricesTable();
    const query = `DELETE FROM amazon_prices WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, "No amazon price found with this ID.");
    }
    return { id, deleted: true };
  } catch (error) {
    console.error("Error deleting amazon price:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while deleting amazon price."
    );
  }
};

const getAllAmazonPrices = async () => {
  try {
    await ensureAmazonPricesTable();
    const [rows] = await db.query("SELECT * FROM amazon_prices");
    return rows;
  } catch (error) {
    console.error("Error retrieving amazon prices:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon prices."
    );
  }
};

const getAmazonPriceById = async (id) => {
  try {
    await ensureAmazonPricesTable();
    const [rows] = await db.query(
      "SELECT * FROM amazon_prices WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error("Error retrieving amazon price:", error.message || error);
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon price."
    );
  }
};

const createAmazonCountryPrice = async (country, price, type = "receiver") => {
  try {
    await ensureAmazonCountryPricesTable();
    const query = `
      INSERT INTO amazon_country_prices (country, price, type)
      VALUES (?, ?, ?)
    `;
    const [result] = await db.query(query, [country, price, type]);
    const [rows] = await db.query(
      "SELECT * FROM amazon_country_prices WHERE id = ?",
      [result.insertId]
    );
    if (!rows.length) {
      throw new ApiError(500, "Failed to retrieve created amazon country price.");
    }
    return rows[0];
  } catch (error) {
    console.error("Error inserting amazon country price:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while inserting amazon country price."
    );
  }
};

const updateAmazonCountryPrice = async (id, country, price, type = "receiver") => {
  try {
    await ensureAmazonCountryPricesTable();
    const query = `
      UPDATE amazon_country_prices
      SET country = ?, price = ?, type = ?
      WHERE id = ?
    `;
    const [result] = await db.query(query, [country, price, type, id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, "No amazon country price found with this ID.");
    }
    const [rows] = await db.query(
      "SELECT * FROM amazon_country_prices WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      throw new ApiError(500, "Failed to retrieve updated amazon country price.");
    }
    return rows[0];
  } catch (error) {
    console.error("Error updating amazon country price:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while updating amazon country price."
    );
  }
};

const deleteAmazonCountryPrice = async (id) => {
  try {
    await ensureAmazonCountryPricesTable();
    const query = `DELETE FROM amazon_country_prices WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      throw new ApiError(404, "No amazon country price found with this ID.");
    }
    return { id, deleted: true };
  } catch (error) {
    console.error("Error deleting amazon country price:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      500,
      "Database error occurred while deleting amazon country price."
    );
  }
};

const getAllAmazonCountryPrices = async () => {
  try {
    await ensureAmazonCountryPricesTable();
    const [rows] = await db.query("SELECT * FROM amazon_country_prices");
    return rows;
  } catch (error) {
    console.error(
      "Error retrieving amazon country prices:",
      error.message || error
    );
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon country prices."
    );
  }
};

const getAmazonCountryPriceById = async (id) => {
  try {
    await ensureAmazonCountryPricesTable();
    const [rows] = await db.query(
      "SELECT * FROM amazon_country_prices WHERE id = ?",
      [id]
    );
    if (!rows.length) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(
      "Error retrieving amazon country price:",
      error.message || error
    );
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon country price."
    );
  }
};

const getAmazonCountryPriceByCountry = async (country, type = "receiver") => {
  try {
    await ensureAmazonCountryPricesTable();
    const [rows] = await db.query(
      "SELECT * FROM amazon_country_prices WHERE country = ? AND type = ? LIMIT 1",
      [country, type]
    );
    if (!rows.length) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(
      "Error retrieving amazon country price by country:",
      error.message || error
    );
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon country price by country."
    );
  }
};

const getAllAmazonCountries = async () => {
  try {
    await ensureAmazonCountryPricesTable();
    const [rows] = await db.query(
      "SELECT country, type FROM amazon_country_prices ORDER BY country"
    );
    
    // Group by type
    const result = {
      sender: [],
      receiver: []
    };
    
    rows.forEach(row => {
      if (row.type === 'sender') {
        result.sender.push(row.country);
      } else {
        result.receiver.push(row.country);
      }
    });
    
    return result;
  } catch (error) {
    console.error(
      "Error retrieving amazon countries:",
      error.message || error
    );
    throw new ApiError(
      500,
      "Database error occurred while fetching amazon countries."
    );
  }
};

module.exports = {
  createDetailsModel,
  updateDetailsModel,
  deleteDetailsModel,
  getSenderDetails,
  getReceiverDetails,
  getAddressBoxesWithCountries,
  getSenderDetailsById,
  getReceiverDetailsById,
  checkExistingSender,
  createDetailsModel_sender,
  checkExistingdelievery,
  createDetailsModel_delievery,
  createAmazonAddress,
  updateAmazonAddress,
  deleteAmazonAddress,
  getAllAmazonAddresses,
  getAmazonAddressById,
  ensureAmazonPricesTable,
  createAmazonPrice,
  updateAmazonPrice,
  deleteAmazonPrice,
  getAllAmazonPrices,
  getAmazonPriceById,
  ensureAmazonCountryPricesTable,
  createAmazonCountryPrice,
  updateAmazonCountryPrice,
  deleteAmazonCountryPrice,
  getAllAmazonCountryPrices,
  getAmazonCountryPriceById,
  getAmazonCountryPriceByCountry,
  getAllAmazonCountries,
};
