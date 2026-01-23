const express = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const {
  createCourierController,
  getAllCouriersController,
  updateCourierController,
  deleteCourierController,
} = require("../controllers/courier.controller");

const courierRouter = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/couriers"); // local uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
courierRouter.route("/create-courier").post(
  verifyJWT,
  upload.single("logo"),
  createCourierController
);

courierRouter.route("/get-couriers").get(verifyJWT, getAllCouriersController);
courierRouter
  .route("/update-courier/:id")
  .put(verifyJWT, upload.single("logo") , updateCourierController);
courierRouter
  .route("/delete-courier/:id")
  .delete(verifyJWT, deleteCourierController);

module.exports = courierRouter;
