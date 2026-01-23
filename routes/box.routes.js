const express = require("express");

const { BoxData } = require("../controllers/box.controller");

const boxRouter = express.Router();

boxRouter.post("/box", BoxData);

module.exports = boxRouter;
