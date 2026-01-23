const express = require("express");

const { shipFromList, shipToList } = require("../controllers/ship.controller");

const shipRouter = express.Router();

shipRouter.get("/ship-from-countries", shipFromList);
shipRouter.get("/ship-to-countries", shipToList);

module.exports = shipRouter;
