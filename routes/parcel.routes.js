const express = require("express");
const multer = require("multer");
const {
  uploadParcelRates,
  getAllRates,
  getAllRatesByCourier,
  deleteRatesByCourier,
} = require("../controllers/parcel.rates.controller");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload-csv", upload.single("file"), uploadParcelRates);
router.get("/rates", getAllRates);
router.get("/rates/:courier/:country", getAllRatesByCourier);
router.delete("/rates/:courier/:country", deleteRatesByCourier);

module.exports = router;
