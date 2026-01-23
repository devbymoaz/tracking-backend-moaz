const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createAmazonCountryPriceController,
  updateAmazonCountryPriceController,
  deleteAmazonCountryPriceController,
  getAmazonCountryPricesController,
  getAmazonCountryPriceByIdController,
  getAmazonCountriesController,
} = require("../controllers/amazonCountryPrice.controller");

const amazonCountryPriceRouter = express.Router();

amazonCountryPriceRouter
  .route("/amazon-country-prices")
  .get(verifyJWT, getAmazonCountryPricesController)
  .post(verifyJWT, createAmazonCountryPriceController);

amazonCountryPriceRouter
  .route("/amazon-country-prices/:id")
  .get(verifyJWT, getAmazonCountryPriceByIdController)
  .put(verifyJWT, updateAmazonCountryPriceController)
  .delete(verifyJWT, deleteAmazonCountryPriceController);

amazonCountryPriceRouter
  .route("/admin/amazon-country-price")
  .get(verifyJWT, getAmazonCountryPricesController)
  .post(verifyJWT, createAmazonCountryPriceController);

amazonCountryPriceRouter
  .route("/admin/amazon-country-price/:id")
  .get(verifyJWT, getAmazonCountryPriceByIdController)
  .put(verifyJWT, updateAmazonCountryPriceController)
  .delete(verifyJWT, deleteAmazonCountryPriceController);

amazonCountryPriceRouter
  .route("/amazon-countries")
  .get(getAmazonCountriesController);

module.exports = amazonCountryPriceRouter;
