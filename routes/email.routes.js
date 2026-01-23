const express = require("express");
const {
  sendOrderConfirmationController,
  snedWelcomEmail,
  snedFirstOrderEmail,
} = require("../controllers/email.controller");
const emailRouter = express.Router();

emailRouter.route("/order-confirmed").post(sendOrderConfirmationController);
emailRouter.route("/welcome-email").post(snedWelcomEmail);
emailRouter.route("/first-order").post(snedFirstOrderEmail);



module.exports = emailRouter;
