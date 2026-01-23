const express = require("express");
const {
  postOrderOutsideItems,
} = require("../controllers/order-outside-items.controller");

// router
const orderOutsideItemsRouter = express.Router();

orderOutsideItemsRouter
  .route("/order-outside-items")
  .post(postOrderOutsideItems);

module.exports = orderOutsideItemsRouter;
