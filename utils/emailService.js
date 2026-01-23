const nodemailer = require("nodemailer");
const path = require("path");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send welcome email to newly registered user
 * @param {string} to - Recipient email address
 * @param {string} userName - User's name
 * @returns {Promise<object>} - Email sending result
 */
const sendWelcomeEmail = async (to, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject: "Welcome to Varamex Express - Your Account is Ready!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">
            <div style="background: #fff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <span style="font-size: 40px;">🎉</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Welcome to Varamex Express!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px; font-weight: 300;">Your journey starts here</p>
          </div>

          <!-- Main Content -->
          <div style="background: #fff; padding: 50px 40px;">
            <div style="margin-bottom: 40px;">
              <h2 style="color: #333; font-size: 24px; margin: 0 0 15px; font-weight: 600;">Hello ${
                userName || "there"
              }! 👋</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Your account has been successfully created. You now have access to powerful tools to manage your global shipments with ease.
              </p>
            </div>

            <!-- Features Section -->
            <div style="background: #f8f9ff; padding: 30px; border-radius: 12px; margin: 40px 0;">
              <h3 style="color: #333; margin: 0 0 20px; font-size: 20px; font-weight: 600;">🚀 With your Varamex Express account, you can now:</h3>
              <div style="margin: 0;">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                  <span style="color: #666; font-size: 16px;">Send a Parcel anywhere in the world</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                  <span style="color: #666; font-size: 16px;">Schedule a Pickup at your location</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                  <span style="color: #666; font-size: 16px;">Print Shipping Labels instantly</span>
                </div>
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                  <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                  <span style="color: #666; font-size: 16px;">Print Invoices for your records</span>
                </div>
                <div style="display: flex; align-items: center;">
                  <span style="color: #667eea; font-size: 18px; margin-right: 10px;">✓</span>
                  <span style="color: #666; font-size: 16px;">View & Track All Shipping Orders in one place</span>
                </div>
              </div>
            </div>

            <!-- CTA Section -->
            <div style="background: #e8f5e8; padding: 25px; border-radius: 12px; margin: 40px 0; text-align: center;">
              <h3 style="color: #333; margin: 0 0 15px; font-size: 20px; font-weight: 600;">🚀 Get started now</h3>
              <p style="color: #666; margin: 0 0 25px; line-height: 1.6; font-size: 16px;">
                Experience fast, secure, and reliable global parcel delivery.
              </p>
              <a href="${
                process.env.FRONTEND_URL || "https://varamex.com"
              }/dashboard" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                padding: 18px 40px;
                text-decoration: none;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                display: inline-block;
                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
              ">
                🏠 Visit Your Dashboard
              </a>
            </div>

            <!-- Support Section -->
            <div style="background: #fff3cd; padding: 25px; border-radius: 12px; margin: 40px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #333; margin: 0 0 15px; font-size: 18px; font-weight: 600;">📞 Need Help?</h3>
              <p style="color: #666; margin: 0; line-height: 1.6; font-size: 15px;">
                Our support team is here to help you get started. If you have any questions or need assistance, 
                don't hesitate to reach out to us at <strong>orders@varamex.com</strong> or visit our help center.
              </p>
            </div>

            <!-- Security Note -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; font-weight: 500;">
                <strong>🔒 Security Tip:</strong> Keep your login credentials safe and never share them with anyone. 
                If you suspect any unauthorized access, change your password immediately.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #155dfc; padding: 30px; text-align: center;">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #ecf0f1; margin: 0 0 10px; font-size: 20px; font-weight: 700;">Varamex Express</h3>
              <p style="color: #95a5a6; margin: 0; font-size: 14px;">
                Excellence in Service, Trust in Delivery
              </p>
            </div>
            
            <div style="margin: 20px 0; padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.2); border-bottom: 1px solid rgba(255,255,255,0.2);">
              <p style="color: #95a5a6; margin: 0; font-size: 14px; line-height: 1.6;">
                📧 orders@varamex.com | 📱 +353851221598<br>
                🌐 <a href="${
                  process.env.FRONTEND_URL || "https://varamex.com"
                }" style="color: #3498db; text-decoration: none;">varamex.com</a>
              </p>
            </div>

            <div>
              <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
                © 2024 Varamex Express. All rights reserved.<br>
                This is an automated welcome message.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name
 * @returns {Promise<object>} - Email sending result
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${userName || "there"},</p>
          <p>You requested a password reset for your account. Please click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          <p>This link is valid for 1 hour.</p>
          <p>Best regards,<br>Varamex Team</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Send order confirmation email
 * @param {string} to - Recipient email address
 * @param {string} invoiceLink - Complete invoice URL
 * @returns {Promise<object>} - Email sending result
 */
const sendOrderConfirmationEmail = async (to, invoiceLink, customerName) => {
  try {
    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject: "Order Confirmed - Varamex Delivery",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background: #fff; padding: 0; border-radius: 10px; box-shadow: 0 5px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <div style="background: rgba(255,255,255,0.2); width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 30px; color: #fff;">📦</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 600;">Varamex Delivery Service</h1>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px; line-height: 1.5;">
              Dear <strong>${customerName || "Customer"}</strong>,
            </p>
            <p style="color: #333; font-size: 16px; margin: 0 0 25px; line-height: 1.6;">
              Thank you for your order. It has been successfully confirmed, and our team will begin processing it shortly.
            </p>
            <p style="color: #333; font-size: 16px; margin: 0 0 30px; line-height: 1.6;">
              You can view your complete invoice and order details by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0 40px;">
              <a href="${invoiceLink}" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                padding: 15px 35px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                font-size: 16px;
                display: inline-block;
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
                transition: all 0.3s ease;
              ">
                📄 View My Order
              </a>
            </div>
            <p style="color: #333; font-size: 16px; margin: 0 0 40px; line-height: 1.6;">
              Soon, you will receive a separate email containing your tracking number.
            </p>

            <div style="background: #f8f9ff; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea; margin: 40px 0;">
              <h3 style="color: #333; margin: 0 0 20px; font-size: 20px; font-weight: 600;">
                📋 How to Prepare Your Parcel – Step by Step:
              </h3>
              <ol style="color: #555; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Pack your parcel securely.</li>
                <li style="margin-bottom: 10px;">Log in to your account.</li>
                <li style="margin-bottom: 10px;">Print your shipping label.</li>
                <li style="margin-bottom: 10px;">If shipping from or to outside the EU, print <strong>three (3) copies</strong> of the commercial invoice – this is mandatory for customs purposes.</li>
                <li style="margin-bottom: 10px;">Attach the shipping label and any required documents to a transparent pouch on the outside of the box or suitcase.</li>
              </ol>
              <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 3px solid #4caf50;">
                <p style="color: #2e7d32; margin: 0; font-size: 14px; font-weight: 500;">
                  📌 <strong>Note:</strong> For shipments within the EU, a commercial invoice is not required.
                </p>
              </div>
            </div>

            <p style="color: #333; font-size: 16px; margin: 30px 0 0; line-height: 1.6; text-align: center;">
              Thank you for choosing our service.
            </p>
          </div>

          <!-- Footer -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; text-align: center; border-radius: 0 0 10px 10px;">
            <p style="color: #fff; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Varamex Delivery Service</p>
            <p style="color: #f0f0f0; margin: 0; font-size: 14px;">
              Need help? Contact us at <a href="mailto:orders@varamex.com" style="color:#fff; text-decoration:none;">orders@varamex.com</a>
            </p>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
              <p style="color: #eee; margin: 0; font-size: 12px;">
                © 2024 Varamex. This is an automated message.
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: "parcel_guide.pdf",
          path: path.join(__dirname, "../documents/parcel_guide.pdf"),
        },
        {
          filename: "prohibbited.pdf",
          path: path.join(__dirname, "../documents/prohibbited.pdf"),
        },
      ],
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};

const sendCollectionDateChangeEmail = async (orderId, oldDate, newDate) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: "smudasser36@gmail.com",
      subject: `Order ${orderId} - Collection Date Updated`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">
            <div style="background: #fff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <span style="font-size: 40px;">📅</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Collection Date Updated</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px; font-weight: 300;">Order #${orderId}</p>
          </div>

          <!-- Main Content -->
          <div style="background: #fff; padding: 50px 40px;">
            <div style="margin-bottom: 40px;">
              <h2 style="color: #333; font-size: 24px; margin: 0 0 15px; font-weight: 600;">Collection Date Changed</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                The collection date for Order #${orderId} has been updated:
              </p>
            </div>

            <!-- Date Comparison -->
            <div style="background: #f8f9ff; padding: 30px; border-radius: 12px; margin: 40px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 200px;">
                  <h3 style="color: #e74c3c; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Previous Date:</h3>
                  <p style="color: #666; margin: 0; font-size: 18px; font-weight: 500;">${
                    oldDate || "Not Set"
                  }</p>
                </div>
                <div style="font-size: 24px; color: #667eea;">→</div>
                <div style="flex: 1; min-width: 200px;">
                  <h3 style="color: #27ae60; margin: 0 0 10px; font-size: 16px; font-weight: 600;">New Date:</h3>
                  <p style="color: #666; margin: 0; font-size: 18px; font-weight: 500;">${newDate}</p>
                </div>
              </div>
            </div>

            <!-- Info Section -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; font-weight: 500;">
                <strong>Note:</strong> This is an automated notification sent when order details are modified.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #2c3e50; padding: 30px; text-align: center;">
            <p style="color: #ecf0f1; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Varamex Delivery Service</p>
            <p style="color: #95a5a6; margin: 0; font-size: 14px;">
              System Notification - Order Management
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #34495e;">
              <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
                © 2024 Varamex. This is an automated message.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Collection date change notification sent for Order #${orderId}`
    );
    return info;
  } catch (error) {
    console.error("Error sending collection date change email:", error);
    throw error;
  }
};

/**
 * Send address change notification email
 * @param {string} orderId - Order ID
 * @param {object} oldCustomer - Previous customer details
 * @param {object} oldDelivery - Previous delivery details
 * @param {object} newCustomer - New customer details
 * @param {object} newDelivery - New delivery details
 * @returns {Promise<object>} - Email sending result
 */
const sendAddressChangeEmail = async (
  orderId,
  oldCustomer,
  oldDelivery,
  newCustomer,
  newDelivery
) => {
  try {
    const customerChanged =
      JSON.stringify(oldCustomer) !== JSON.stringify(newCustomer);
    const deliveryChanged =
      JSON.stringify(oldDelivery) !== JSON.stringify(newDelivery);
    const old = JSON.parse(JSON.parse(oldCustomer));
    const new_cus = JSON.parse(JSON.parse(newCustomer));
    const old_del = JSON.parse(JSON.parse(oldDelivery));
    const new_del = JSON.parse(JSON.parse(newDelivery));
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: "smudasser36@gmail.com",
      subject: `Order ${orderId} - Address Details Updated`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">
            <div style="background: #fff; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
              <span style="font-size: 40px;">📍</span>
            </div>
            <h1 style="color: #fff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">Address Updated</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px; font-weight: 300;">Order #${orderId}</p>
          </div>
          <!-- Main Content -->
          <div style="background: #fff; padding: 50px 40px;">
            <div style="margin-bottom: 40px;">
              <h2 style="color: #333; font-size: 24px; margin: 0 0 15px; font-weight: 600;">Address Details Changed</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                The following address details for Order #${orderId} have been updated:
              </p>
            </div>

            ${
              customerChanged
                ? `
            <!-- Customer Address Section -->
            <div style="background: #f8f9ff; padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #667eea;">
              <h3 style="color: #333; margin: 0 0 20px; font-size: 20px; font-weight: 600;">📦 Customer Details</h3>
              
              <div style="margin-bottom: 25px;">
                <h4 style="color: #e74c3c; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Previous:</h4>
                <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                  <pre style="margin: 0; font-family: 'Segoe UI', sans-serif; white-space: pre-wrap; color: #666;">${old.addressLine1}</pre>
                </div>
              </div>
              
              <div>
                <h4 style="color: #27ae60; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Updated:</h4>
                <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                  <pre style="margin: 0; font-family: 'Segoe UI', sans-serif; white-space: pre-wrap; color: #666;">${new_cus.addressLine1}</pre>
                </div>
              </div>
            </div>
            `
                : ""
            }

            ${
              deliveryChanged
                ? `
            <!-- Delivery Address Section -->
            <div style="background: #f0f9ff; padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #333; margin: 0 0 20px; font-size: 20px; font-weight: 600;">🚚 Delivery Details</h3>
              
              <div style="margin-bottom: 25px;">
                <h4 style="color: #e74c3c; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Previous:</h4>
                <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                  <pre style="margin: 0; font-family: 'Segoe UI', sans-serif; white-space: pre-wrap; color: #666;">${old_del.addressLine1}</pre>
                </div>
              </div>
              
              <div>
                <h4 style="color: #27ae60; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Updated:</h4>
                <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0;">
                  <pre style="margin: 0; font-family: 'Segoe UI', sans-serif; white-space: pre-wrap; color: #666;">${new_del.addressLine1}</pre>
                </div>
              </div>
            </div>
            `
                : ""
            }

            <!-- Info Section -->
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
              <p style="color: #856404; margin: 0; font-size: 14px; font-weight: 500;">
                <strong>Note:</strong> This is an automated notification sent when order details are modified.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #2c3e50; padding: 30px; text-align: center;">
            <p style="color: #ecf0f1; margin: 0 0 10px; font-size: 16px; font-weight: 600;">Varamex Delivery Service</p>
            <p style="color: #95a5a6; margin: 0; font-size: 14px;">
              System Notification - Order Management
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #34495e;">
              <p style="color: #7f8c8d; margin: 0; font-size: 12px;">
                © 2024 Varamex. This is an automated message.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Address change notification sent for Order #${orderId}`);
    return info;
  } catch (error) {
    console.error("Error sending address change email:", error);
    throw error;
  }
};

/**
 * Send first order confirmation email
 * @param {string} to - Recipient email address
 * @param {string} customerName - Customer's name
 * @returns {Promise<object>} - Email sending result
 */
const sendFirstOrderEmail = async (to, customerName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to,
      subject: "🎉 Thank You for Your First Order with Varamex Express!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 35px; text-align: center;">
            <div style="background: #fff; padding: 15px 25px; border-radius: 12px; margin: 0 auto 15px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.15);">
              <img src="${
                process.env.LOGO_URL || "https://varamex.com/logo.png"
              }" alt="Varamex Logo" style="height: 45px; width: auto; display: block;" />
            </div>
            <h1 style="color: #fff; font-size: 26px; margin: 0; font-weight: 700;">Thank You for Your First Order!</h1>
          </div>

          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px; line-height: 1.6;">
              Hi <strong>${(customerName || "Customer").toUpperCase()}</strong>,
            </p>
            <p style="color: #555; font-size: 16px; margin: 0 0 25px; line-height: 1.6;">
              Thank you for placing your first order with us! From now on, you can track and manage all your parcels in one place — making shipping easier, faster, and more reliable than ever.
            </p>

            <!-- Features -->
            <div style="background: #f9f9ff; padding: 25px; border-radius: 10px; margin: 30px 0;">
              <h3 style="color: #333; margin: 0 0 20px; font-size: 18px; font-weight: 600;">With your account, you can:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin-bottom: 12px; font-size: 15px; color: #555;">📦 View all active shipments at a glance</li>
                <li style="margin-bottom: 12px; font-size: 15px; color: #555;">⏱ Get real-time tracking updates</li>
                <li style="margin-bottom: 12px; font-size: 15px; color: #555;">📝 Manage addresses and past orders in one place</li>
                <li style="margin-bottom: 0; font-size: 15px; color: #555;">🚀 Book new shipments in just a few clicks</li>
              </ul>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin: 40px 0;">
              <a href="${
                process.env.FRONTEND_URL || "https://varamex.com"
              }/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #fff; padding: 14px 35px; text-decoration: none;
                        border-radius: 30px; font-size: 15px; font-weight: 600;
                        display: inline-block; box-shadow: 0 5px 15px rgba(102,126,234,0.3);">
                Log In Now
              </a>
            </div>

            <p style="color: #555; font-size: 15px; margin: 0; line-height: 1.6;">
              We're excited to make your shipping experience smooth and stress-free.<br><br>
              Thank you for choosing <strong>Varamex Express</strong> — we look forward to shipping with you!
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #2c3e50; padding: 25px; text-align: center;">
            <p style="color: #fff; margin: 0; font-size: 16px; font-weight: 600;">Varamex Express</p>
            <p style="color: #bdc3c7; margin: 5px 0 0; font-size: 13px;">Excellence in Service, Trust in Delivery</p>
            <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px;">
              <p style="color: #95a5a6; margin: 0; font-size: 12px;">© 2024 Varamex Express. This is an automated message.</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`First order email sent successfully to ${to}`);
    return info;
  } catch (error) {
    console.error("Error sending first order email:", error);
    throw error;
  }
};


module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendAddressChangeEmail,
  sendCollectionDateChangeEmail,
  sendFirstOrderEmail,
};
