// Route updates for update and delete functionality

const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createDetails,
  updateDetails,
  deleteDetails,
  getDetails,
  getDetailsReceiver,
  getSenderDetails_ById,
  getReceiverDetails_ById,
  createDetails_sender,
  getAddressByUserId,
  createDetails_receiver,
  getDelieveryAddressByUserId,
} = require("../controllers/ad_book_controller");
const address_book_router = express.Router();

// Create routes
address_book_router
  .route("/create-sender-details")
  .post(verifyJWT, createDetails);

address_book_router
  .route("/create-details-sender")
  .post(verifyJWT, createDetails_sender);

address_book_router
  .route("/create-details-delievery")
  .post(verifyJWT, createDetails_receiver);

address_book_router
  .route("/create-receiver-details")
  .post(verifyJWT, createDetails);

// Get routes
address_book_router
  .route("/stored-sender-details/:id")
  .get(verifyJWT, getAddressByUserId);

address_book_router
  .route("/stored-delievery-details/:id")
  .get(verifyJWT, getDelieveryAddressByUserId);

address_book_router.route("/sender-details").get(verifyJWT, getDetails);

address_book_router
  .route("/sender-details/:id")
  .get(verifyJWT, getSenderDetails_ById);

address_book_router
  .route("/receiver-details/:id")
  .get(verifyJWT, getReceiverDetails_ById);

address_book_router
  .route("/receiver-details")
  .get(verifyJWT, getDetailsReceiver);

// Update routes
address_book_router
  .route("/update-sender-details/:id")
  .put(verifyJWT, updateDetails);

address_book_router
  .route("/update-receiver-details/:id")
  .put(verifyJWT, updateDetails);

// Delete routes
address_book_router
  .route("/delete-sender-details/:id")
  .delete(verifyJWT, deleteDetails);

address_book_router
  .route("/delete-receiver-details/:id")
  .delete(verifyJWT, deleteDetails);

module.exports = address_book_router;
