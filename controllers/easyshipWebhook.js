const { asyncHandler } = require("../utils/asyncHandler");
const { createLog } = require("../models/webhookModel");

const easyshipWebhook = asyncHandler(async (req, res, next) => {
  try {
      const logData = req.body; 
      await createLog(req)
      await createLog(logData);
      await createLog(req.query)

      return res.status(200).json({ message: "Log saved successfully!" });
  } catch (err) {
      console.error("Error saving log to database:", err);
      return res.status(500).json({ message: "Failed to save log" });
  }
})

module.exports = { easyshipWebhook };
