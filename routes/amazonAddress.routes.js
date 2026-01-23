const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createAmazonAddressController,
  updateAmazonAddressController,
  deleteAmazonAddressController,
  getAmazonAddressesController,
  getAmazonAddressByIdController,
} = require("../controllers/amazonAddress.controller");

const amazonAddressRouter = express.Router();

amazonAddressRouter
  .route("/admin/amazon-address")
  .get(verifyJWT, getAmazonAddressesController)
  .post(verifyJWT, createAmazonAddressController);

amazonAddressRouter
  .route("/admin/amazon-address/:id")
  .get(verifyJWT, getAmazonAddressByIdController)
  .put(verifyJWT, updateAmazonAddressController)
  .delete(verifyJWT, deleteAmazonAddressController);

amazonAddressRouter
  .route("/amazon-addresses")
  .get(verifyJWT, getAmazonAddressesController)
  .post(verifyJWT, createAmazonAddressController);

amazonAddressRouter
  .route("/amazon-addresses/:id")
  .get(verifyJWT, getAmazonAddressByIdController)
  .put(verifyJWT, updateAmazonAddressController)
  .delete(verifyJWT, deleteAmazonAddressController);

module.exports = amazonAddressRouter;
