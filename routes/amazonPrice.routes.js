const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createAmazonPriceController,
  updateAmazonPriceController,
  deleteAmazonPriceController,
  getAmazonPricesController,
  getAmazonPriceByIdController,
} = require("../controllers/amazonPrice.controller");

const amazonPriceRouter = express.Router();

amazonPriceRouter
  .route("/amazon-prices")
  .get(verifyJWT, getAmazonPricesController)
  .post(verifyJWT, createAmazonPriceController);

amazonPriceRouter
  .route("/amazon-prices/:id")
  .get(verifyJWT, getAmazonPriceByIdController)
  .put(verifyJWT, updateAmazonPriceController)
  .delete(verifyJWT, deleteAmazonPriceController);

amazonPriceRouter
  .route("/admin/amazon-price")
  .get(verifyJWT, getAmazonPricesController)
  .post(verifyJWT, createAmazonPriceController);

amazonPriceRouter
  .route("/admin/amazon-price/:id")
  .get(verifyJWT, getAmazonPriceByIdController)
  .put(verifyJWT, updateAmazonPriceController)
  .delete(verifyJWT, deleteAmazonPriceController);

module.exports = amazonPriceRouter;

