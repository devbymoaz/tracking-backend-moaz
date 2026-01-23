const { storePaymentController, getPaymentsByUserIdController, deductPaymentController } = require("../controllers/userPaymentController");
const { verifyJWT } = require("../middlewares/auth.middleware");
const express = require("express");
// router
const paymentRouter = express.Router();


paymentRouter.route("/store-payment").post(verifyJWT, storePaymentController);
paymentRouter.route("/get-wallet").get(verifyJWT, getPaymentsByUserIdController);
paymentRouter.route("/deduct-amount").post(verifyJWT, deductPaymentController);

module.exports = paymentRouter;
