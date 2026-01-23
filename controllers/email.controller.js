const { ApiError } = require("../utils/ApiError");
const { sendOrderConfirmationEmail, sendWelcomeEmail, sendFirstOrderEmail } = require("../utils/emailService");

const sendOrderConfirmationController = async (req, res) => {
  try {
    const { to, invoiceLink, name } = req.body;

    if (!to || !invoiceLink) {
      throw new ApiError(400, "All fields are required: to, invoiceLink");
    }

    const result = await sendOrderConfirmationEmail(to, invoiceLink, name);

    res.status(200).json({
      message: "Order confirmation email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to send order confirmation email",
    });
  }
};

const snedWelcomEmail = async (req, res) => {
  try {
    const { to, name } = req.body;

    if (!to || !name) {
      throw new ApiError(400, "All fields are required: to, invoiceLink");
    }

    const result = await sendWelcomeEmail(to, name);

    res.status(200).json({
      message: "Confirmation email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to send order confirmation email",
    });
  }
};

const snedFirstOrderEmail = async (req, res) => {
  try {
    const { to, name } = req.body;

    if (!to || !name) {
      throw new ApiError(400, "All fields are required: to, invoiceLink");
    }

    const result = await sendFirstOrderEmail(to, name);

    res.status(200).json({
      message: "Email sent successfully",
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    res.status(error.statusCode || 500).json({
      error: error.message || "Failed to send order confirmation email",
    });
  }
};
module.exports = {
  sendOrderConfirmationController,
  snedWelcomEmail,
  snedFirstOrderEmail,
};
