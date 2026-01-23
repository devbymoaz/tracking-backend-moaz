// Controller updates for update and delete functionality

const { db } = require("../db");
const {
  getAddressBoxes,
  getAddressBoxesWithCountries,
  createDetailsModel,
  updateDetailsModel,
  deleteDetailsModel,
  getSenderDetails,
  getReceiverDetails,
  getSenderDetailsById,
  getReceiverDetailsById,
  checkExistingSender,
  createDetailsModel_sender,
  checkExistingdelievery,
  createDetailsModel_delievery,
} = require("../models/address_book");
const { ApiError } = require("../utils/ApiError");

const createDetails = async (req, res, next) => {
  try {
    const { details, user_id, type } = req.body;

    if (!details || !user_id) {
      return next(new ApiError(400, "Sender details and user id are required"));
    }

    const senderDetails = await createDetailsModel(details, user_id, type);

    return res.status(201).json({
      message: "Address box created successfully.",
      data: senderDetails,
    });
  } catch (error) {
    next(error);
  }
};

const updateDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { details, type } = req.body;

    if (!details) {
      return next(new ApiError(400, "Details are required"));
    }

    if (!type || (type !== "sender" && type !== "receiver")) {
      return next(
        new ApiError(400, "Valid type (sender or receiver) is required")
      );
    }

    const updatedDetails = await updateDetailsModel(id, details, type);

    return res.status(200).json({
      message: `${
        type === "sender" ? "Sender" : "Receiver"
      } details updated successfully.`,
      data: updatedDetails,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { type } = req.query;

    if (!type || (type !== "sender" && type !== "receiver")) {
      return next(
        new ApiError(400, "Valid type (sender or receiver) is required")
      );
    }

    await deleteDetailsModel(id, type);

    return res.status(200).json({
      message: `${
        type === "sender" ? "Sender" : "Receiver"
      } details deleted successfully.`,
      data: { id, deleted: true },
    });
  } catch (error) {
    next(error);
  }
};

const createDetails_sender = async (req, res, next) => {
  try {
    const { details, user_id, sender } = req.body;

    if (!details || !user_id || !sender) {
      return next(
        new ApiError(400, "Sender details, user id, and sender are required")
      );
    }

    // Check if sender value already exists in the table
    const existingSender = await checkExistingSender(sender, user_id);
    if (existingSender) {
      return res.status(200).json({
        message: "Sender details already exist. No new entry created.",
        data: existingSender,
      });
    }

    // If sender does not exist, insert new record
    const senderDetails = await createDetailsModel_sender(
      details,
      user_id,
      sender
    );

    return res.status(201).json({
      message: "Sender details created successfully.",
      data: senderDetails,
    });
  } catch (error) {
    next(error);
  }
};

const createDetails_receiver = async (req, res, next) => {
  try {
    const { details, user_id, delievery } = req.body;

    if (!details || !user_id || !delievery) {
      return next(
        new ApiError(
          400,
          "delievery details, user id, and delievery are required"
        )
      );
    }

    // Check if sender value already exists in the table
    const existingSender = await checkExistingdelievery(delievery, user_id);
    if (existingSender) {
      return res.status(200).json({
        message: "Sender details already exist. No new entry created.",
        data: existingSender,
      });
    }

    // If sender does not exist, insert new record
    const senderDetails = await createDetailsModel_delievery(
      details,
      user_id,
      delievery
    );

    return res.status(201).json({
      message: "Sender details created successfully.",
      data: senderDetails,
    });
  } catch (error) {
    next(error);
  }
};

const getAddressByUserId = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return next(new ApiError(400, "User ID is required"));
    }

    // Step 1: Check user role
    const roleQuery = `SELECT role FROM users WHERE id = ?`;
    const [userRows] = await db.query(roleQuery, [user_id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userRole = userRows[0].role;

    // Step 2: Fetch addresses
    let query;
    let params = [];

    if (userRole === "admin") {
      query = `SELECT * FROM sender_details`;
    } else {
      query = `SELECT * FROM sender_details WHERE user_id = ?`;
      params = [user_id];
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No address found." });
    }

    // Step 3: Remove duplicates
    const uniqueAddresses = rows.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.sender.trim().toLowerCase() === value.sender.trim().toLowerCase()
        )
    );

    return res.status(200).json({ data: uniqueAddresses });
  } catch (error) {
    console.error("Error fetching address:", error);
    next(new ApiError(500, "Database error occurred while fetching address."));
  }
};


const getDelieveryAddressByUserId = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return next(new ApiError(400, "User ID is required"));
    }

    // Step 1: Check user role
    const roleQuery = `SELECT role FROM users WHERE id = ?`;
    const [userRows] = await db.query(roleQuery, [user_id]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userRole = userRows[0].role;

    // Step 2: Fetch delivery addresses
    let query;
    let params = [];

    if (userRole === "admin") {
      query = `SELECT * FROM receiver_details`;
    } else {
      query = `SELECT * FROM receiver_details WHERE user_id = ?`;
      params = [user_id];
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No address found." });
    }

    // Step 3: Remove duplicates based on receiver name
    const uniqueAddresses = rows.filter(
      (value, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.delievery.trim().toLowerCase() === value.delievery.trim().toLowerCase()
        )
    );

    return res.status(200).json({ data: uniqueAddresses });
  } catch (error) {
    console.error("Error fetching address:", error);
    next(new ApiError(500, "Database error occurred while fetching delivery address."));
  }
};


const getDelAddressByUserId = async (req, res, next) => {
  try {
    const user_id = req.params.id;

    if (!user_id) {
      return next(new ApiError(400, "User ID is required"));
    }

    const query = `SELECT * FROM receiver_details WHERE user_id = ?`;
    const [rows] = await db.query(query, [user_id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No address found for this user." });
    }

    return res.status(200).json({ data: rows });
  } catch (error) {
    console.error("Error fetching address:", error);
    next(new ApiError(500, "Database error occurred while fetching address."));
  }
};

const getDetails = async (req, res, next) => {
  try {
    const sender_details = await getSenderDetails();
    return res.status(200).json({
      message: "Address books retrieved successfully.",
      data: sender_details,
    });
  } catch (error) {
    next(error);
  }
};

const getSenderDetails_ById = async (req, res, next) => {
  try {
    const sender_details = await getSenderDetailsById(req.params.id);
    return res.status(200).json({
      message: "Retrieved successfully.",
      data: sender_details,
    });
  } catch (error) {
    next(error);
  }
};

const getReceiverDetails_ById = async (req, res, next) => {
  try {
    const receiver_details = await getReceiverDetailsById(req.params.id);
    return res.status(200).json({
      message: "Retrieved successfully.",
      data: receiver_details,
    });
  } catch (error) {
    next(error);
  }
};

const getDetailsReceiver = async (req, res, next) => {
  try {
    const receiver_details = await getReceiverDetails();
    return res.status(200).json({
      message: "Address books retrieved successfully.",
      data: receiver_details,
    });
  } catch (error) {
    next(error);
  }
};

const getAddressBoxesWithCountriesController = async (req, res, next) => {
  try {
    const addressBoxes = await getAddressBoxesWithCountries();

    return res.status(200).json({
      message: "Address books with countries retrieved successfully.",
      data: addressBoxes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDetails,
  updateDetails,
  deleteDetails,
  getDetails,
  getDetailsReceiver,
  getAddressBoxesWithCountriesController,
  getSenderDetails_ById,
  getReceiverDetails_ById,
  createDetails_sender,
  getAddressByUserId,
  getDelAddressByUserId,
  createDetails_receiver,
  getDelieveryAddressByUserId,
};
