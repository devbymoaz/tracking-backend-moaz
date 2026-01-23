const express = require("express");

const { selectedCategoryCardRates } = require("../controllers/card.controller");

const cardRouter = express.Router();

cardRouter.post("/selected-card-rates", selectedCategoryCardRates);

module.exports = cardRouter;
