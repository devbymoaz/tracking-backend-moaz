const express = require("express");
const itemsRouter = express.Router();
const { fetchAllItems } = require("../controllers/items.controller");

// Define the endpoint
itemsRouter.get("/items", fetchAllItems);

module.exports = itemsRouter;
