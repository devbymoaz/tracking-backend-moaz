const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createBrandedBox,
  getBrandedBoxesController,
  getSelectedBrandedBoxes,
  updateBrandedBoxController,
  deleteBrandedBoxController,
} = require("../controllers/brandedBox");
const brandedBoxRouter = express.Router();

brandedBoxRouter.route("/create-branded-box").post(verifyJWT, createBrandedBox);
brandedBoxRouter
  .route("/branded-boxes")
  .get(verifyJWT, getBrandedBoxesController);
brandedBoxRouter
  .route("/selected-branded-boxes")
  .get(verifyJWT, getSelectedBrandedBoxes);
brandedBoxRouter
  .route("/branded-box/:id")
  .put(verifyJWT, updateBrandedBoxController);
brandedBoxRouter
  .route("/branded-box/:id")
  .delete(verifyJWT, deleteBrandedBoxController);
module.exports = brandedBoxRouter;
