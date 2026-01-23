const express = require("express");
const zoneRouter = express.Router();
const { fetchAllZones } = require("../controllers/zone.controller");

// Define the endpoint
zoneRouter.get("/zones", fetchAllZones);

module.exports = zoneRouter;
