const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createCustomBoxController,
  getCustomBoxesController,
  updateCustomBoxController,
  deleteCustomBoxController,
} = require("../controllers/cutomBox");
const customBoxRouter = express.Router();

customBoxRouter
  .route("/create-custom-box")
  .post(verifyJWT, createCustomBoxController);
customBoxRouter
  .route("/update-custom-box/:boxId")
  .put(verifyJWT, updateCustomBoxController);
customBoxRouter
  .route("/delete-custom-box/:boxId")
  .delete(verifyJWT, deleteCustomBoxController);
customBoxRouter
  .route("/get-custom-box")
  .get(verifyJWT, getCustomBoxesController);

module.exports = customBoxRouter;
