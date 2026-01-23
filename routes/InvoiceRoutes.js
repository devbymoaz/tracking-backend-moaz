const express = require("express");
const {
  generateInvoiceController,
  generateSaleInvoiceController,
} = require("../controllers/invoiceController");

const invoiceRouter = express.Router();

invoiceRouter.route("/create-invoice").post(generateInvoiceController);
invoiceRouter.route("/create-sale-invoice").post(generateSaleInvoiceController);

module.exports = invoiceRouter;
