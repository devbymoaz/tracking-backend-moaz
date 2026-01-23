const express = require("express");
const { easyshipWebhook } = require("../controllers/easyshipWebhook");
const easyshipRouter = express.Router();

easyshipRouter.route("/easyship-webhook").get(easyshipWebhook);







module.exports = easyshipRouter;
