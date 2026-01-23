const express = require("express");
const {
  uploadFileRates,
  upload,
  fetchAllRates,
  updateRatesMarkup,
} = require("../controllers/rates.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

// router
const ratesRouter = express.Router();

ratesRouter
  .route("/upload-rates")
  .post(verifyJWT, upload.single("file"), uploadFileRates);

ratesRouter.route("/rates-markup").post(verifyJWT, updateRatesMarkup);
ratesRouter.route("/rates-p").get(fetchAllRates);

module.exports = ratesRouter;
