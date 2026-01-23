const express = require("express");
const {
  uploadShippingLabel,
} = require("../controllers/shipping_label.controller");
const router = express.Router();

router.post("/upload-shipping-label", uploadShippingLabel);

module.exports = router;
