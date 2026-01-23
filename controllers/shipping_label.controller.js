const multer = require("multer");
const path = require("path");
const { markShippingLabelUploaded } = require("../models/shipping_label.model");

// Multer setup - save files in uploads/shipping_labels/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/shipping_labels/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `order_${req.body.orderId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({ storage, fileFilter }).single("shippingLabel");

const uploadShippingLabel = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required" });
    }

    try {
      const result = await markShippingLabelUploaded(orderId);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      return res.status(200).json({
        message: "Shipping label uploaded successfully",
        filePath: req.file.path,
      });
    } catch (error) {
      console.error("Error uploading shipping label:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

module.exports = { uploadShippingLabel };
