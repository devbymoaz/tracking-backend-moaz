const express = require("express");
const {
  fetchAllOrders,
  deleteAnOrder,
  postOrder,
  orderMarkup,
  fetchOrderById,
  updateOrder,
  updateIsCustomStatus,
  fetchFilteredOrders,
  fetchOrdersWithPickupState,
  fetchCustomOrders,
  fetchAllOrdersEasyShip,
  compareAndCreateOrders,
  processOrders,
  updateCourier,
  updateTrackingUrl,
  fetchOrdersByUser,
  updateCustomRemarks,
  updateReason,
  updateTrackingNum,
  updateRawData,
  updateCollectionDate,
  updateOrderStatus,
  updateAddresses,
  updateCollectionDateOrStatus,
  getTodayOrders,
} = require("../controllers/order.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/multer.middleware");
const {
  updateOrderItemsController,
  updateOrderOutsideItemsController,
} = require("../controllers/order-items.controller");

// router
const orderRouter = express.Router();

orderRouter.route("/order").post(verifyJWT, upload.single("upload_doc"), postOrder);
orderRouter.route("/update-custom").put(updateIsCustomStatus);
orderRouter.route("/markup").post(verifyJWT, orderMarkup);
orderRouter.route("/orders").get(fetchAllOrders);
orderRouter.route("/my-order").get(fetchOrdersByUser);
orderRouter.route("/filtered-orders").get(fetchFilteredOrders);
orderRouter.route("/manage-orders").get(fetchOrdersWithPickupState);
orderRouter.route("/custom-orders").get(fetchCustomOrders);
orderRouter.route("/today-orders").get(getTodayOrders);
orderRouter.route("/update-courier").put(updateCourier);
orderRouter.route("/order").delete(verifyJWT, deleteAnOrder);
orderRouter.route("/order/:id").get(verifyJWT, fetchOrderById);
orderRouter.route("/order/:id").put(verifyJWT, updateOrder);
orderRouter.route("/order/item").post(verifyJWT, updateOrderItemsController);
orderRouter.put("/update-tracking-url", updateTrackingUrl);
orderRouter.put("/update-custom-remarks", updateCustomRemarks);
orderRouter.put("/update-date-status", updateCollectionDateOrStatus);
orderRouter.put("/update-shipping-reason", updateReason);
orderRouter.put("/update-tracking-number", updateTrackingNum);
orderRouter.put("/update-raw-data", updateRawData);
orderRouter.put("/update-collection-date", updateCollectionDate);
orderRouter.put("/cancel-order", updateOrderStatus);
orderRouter.put("/update-addresses", updateAddresses);

orderRouter
  .route("/order/item-outside")
  .post(verifyJWT, updateOrderOutsideItemsController);
orderRouter.route("/easyship-all").get(verifyJWT, fetchAllOrdersEasyShip);
orderRouter.route("/process-orders").get(verifyJWT, processOrders);
orderRouter
  .route("/easyship-orders-create")
  .post(verifyJWT, compareAndCreateOrders);

module.exports = orderRouter;
