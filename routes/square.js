const express = require("express");
const handler = require("../controllers/square");

// router
const squareRouter = express.Router();

squareRouter.post("/pay", handler);

module.exports = squareRouter;
