const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { db } = require("./db/index.js");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
require("./passportConfig");
const crypto = require("crypto");
const Stripe = require("stripe");
const SECRET = process.env.EASYSHIP_WEBHOOK_SECRET;
// Initialize Stripe with your secret key
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create OAuth client for verifying Google tokens
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Function to verify Google tokens
async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket;
}

// Middleware
app.use(
  cors({
    origin: [
      "https://varamex.com",
      "https://www.varamex.com",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://localhost:8000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Static file serving
app.use("/invoices", express.static(path.join(__dirname, "./invoices")));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

app.use(
  "/saleinvoices",
  express.static(path.join(__dirname, "./saleinvoices"))
);
app.use(
  "/uploads/shipping_label",
  express.static(path.join(__dirname, "./uploads/shipping_labels"))
);

// Routes imports (keeping your existing routes)
const userRouter = require("./routes/user.routes");
const ratesRouter = require("./routes/rates.routes");
const shipRouter = require("./routes/ship.routes");
const cardRouter = require("./routes/card.routes");
const itemsRouter = require("./routes/items.routes");
const zoneRouter = require("./routes/zone.routes");
const boxRouter = require("./routes/box.routes");
const orderRouter = require("./routes/order.routes");
const orderOutsideItemsRouter = require("./routes/order-outside-items.routes");
const custom_box = require("./routes/customBoxRoutes");
const address_book = require("./routes/ad_book.routes");
const square = require("./routes/square");
const wallet = require("./routes/userPaymentsRoutes");
const eashyship = require("./routes/easyshipRoutes");
const { shipToList } = require("./controllers/ship.controller");
const bodyParser = require("body-parser");
const invoice = require("./routes/InvoiceRoutes");
const courier = require("./routes/courier.routes");
const parcel = require("./routes/parcel.routes");
const branded = require("./routes/brandedBoxesRoutes.js");
const shippingLabelRouter = require("./routes/shipping_label.routes");
const emailRouter = require("./routes/email.routes");
const amazonAddressRouter = require("./routes/amazonAddress.routes");
const amazonCountryPriceRouter = require("./routes/amazonCountryPrice.routes");
const { updateOrderDeliveryState } = require("./controllers/webhook/orderDetialsUpdate.js");

// Use existing routes
app.use("/api/v1", amazonCountryPriceRouter);
app.use("/api/v1", amazonAddressRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", orderOutsideItemsRouter);
app.use("/api/v1", ratesRouter);
app.use("/api/v1", shipRouter);
app.use("/api/v1", cardRouter);
app.use("/api/v1", itemsRouter);
app.use("/api/v1", zoneRouter);
app.use("/api/v1", boxRouter);
app.use("/api/v1", custom_box);
app.use("/api/v1", address_book);
app.use("/api/v1", square);
app.use("/api/v1", wallet);
app.use("/api/v1", eashyship);
app.use("/api/v1", invoice);
app.use("/api/v1", courier);
app.use("/api/v1", parcel);
app.use("/api/v1", branded);
app.use("/api/v1", shippingLabelRouter);
app.use("/api/v1", emailRouter);

// Passport configuration (keeping your existing Google OAuth setup)
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:8000/auth/google/callback",
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        const [rows] = await db.query(
          "SELECT * FROM users WHERE google_id = ?",
          [profile.id]
        );
        if (rows.length > 0) {
          return done(null, rows[0]);
        } else {
          const [result] = await db.query(
            "INSERT INTO users (google_id, email, name, profile_image) VALUES (?, ?, ?, ?)",
            [
              profile.id,
              profile.emails[0].value,
              profile.displayName,
              profile.photos[0].value,
            ]
          );
          const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [
            result.insertId,
          ]);
          return done(null, newUser[0]);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error);
  }
});

// =============================================================================
// STRIPE PAYMENT ROUTES
// =============================================================================

// Easyship Webhook

const createLog = async (data) => {
  try {
    const logFilePath = path.join(__dirname, "easyship_logs.txt");

    // Create logs directory if it doesn't exist
    const logsDir = path.dirname(logFilePath);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Create log entry with better formatting
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] EASYSHIP WEBHOOK: ${JSON.stringify(
      data,
      null,
      2
    )}\n${"=".repeat(80)}\n`;

    // Use async file operations with proper error handling
    await fs.promises.appendFile(logFilePath, logEntry, "utf8");

    console.log(`✅ Log saved to: ${logFilePath}`);
  } catch (err) {
    console.error("❌ Error writing log:", err);

    // Fallback: try to write to a different location
    try {
      const fallbackPath = path.join(
        process.cwd(),
        "easyship_logs_fallback.txt"
      );
      const logEntry = `[${new Date().toISOString()}] FALLBACK LOG: ${JSON.stringify(
        data
      )}\n`;
      await fs.promises.appendFile(fallbackPath, logEntry, "utf8");
      console.log(`✅ Fallback log saved to: ${fallbackPath}`);
    } catch (fallbackErr) {
      console.error("❌ Fallback logging also failed:", fallbackErr);
    }
  }
};

app.post("/webhooks/easyship", async (req, res) => {
  const payload = req.body;

  try {
    // Console pe print with better formatting
    console.log("✅ Received Easyship event:");
    console.log("Event Type:", payload.event_type || "Unknown");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log("=".repeat(50));

    // File me log save - await the async operation
    await createLog(payload);
    if (payload.event_type === "shipment.tracking.status.changed") {
      const shipmentId = payload.data.easyship_shipment_id;
      const status = payload.data.status;

      // Call the function to update DB
      await updateOrderDeliveryState(shipmentId, status);
    }
    // Send success response
    res.status(200).json({
      message: "Webhook received successfully",
      timestamp: new Date().toISOString(),
      event_type: payload.event_type || "unknown",
    });
  } catch (err) {
    console.error("❌ Error handling Easyship webhook:", err);

    // Still try to log the error
    try {
      await createLog({
        error: err.message,
        payload: payload,
        timestamp: new Date().toISOString(),
      });
    } catch (logErr) {
      console.error("❌ Failed to log error:", logErr);
    }

    res.status(500).json({
      error: "Webhook processing failed",
      message: err.message,
    });
  }
});

// Create Payment Intent (Enhanced version)
app.post("/api/v1/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = "usd", metadata = {} } = req.body;

    // Validate amount
    if (!amount || amount < 50) {
      // Minimum 50 cents
      return res.status(400).json({
        error: "Invalid amount. Minimum amount is 50 cents.",
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Ensure integer
      currency: currency.toLowerCase(),
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Payment Intent Error:", error);
    res.status(500).json({
      error: error.message || "Failed to create payment intent",
    });
  }
});

// Process Payment (for your frontend's payment method)
app.post("/api/v1/process-payment", async (req, res) => {
  try {
    const {
      paymentMethodId,
      amount,
      currency = "usd",
      customerInfo,
      saveCustomer,
      saveCard,
      metadata = {},
    } = req.body;

    if (!paymentMethodId || !amount) {
      return res.status(400).json({
        error: "Payment method ID and amount are required",
      });
    }

    let customerId;

    if (saveCustomer) {
      // Check if customer with the same email already exists
      const existingCustomers = await stripe.customers.list({
        email: customerInfo.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        });
        customerId = customer.id;
      }

      if (saveCard && customerId) {
        // Attach card to customer
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });

        // Set default payment method
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      payment_method: paymentMethodId,
      customer: customerId,
      metadata: {
        ...metadata,
        customerEmail: customerInfo?.email || "",
        customerName: customerInfo?.name || "",
        timestamp: new Date().toISOString(),
      },
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    if (paymentIntent.status === "succeeded") {
      res.status(200).json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        customer: customerId || null,
        card: saveCard ? paymentMethodId : null,
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Payment failed",
        status: paymentIntent.status,
      });
    }
  } catch (error) {
    console.error("Process Payment Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Payment processing failed",
    });
  }
});

// Get Payment Intent Status
app.get("/api/v1/payment-intent/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const paymentIntent = await stripe.paymentIntents.retrieve(id);

    res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
      },
    });
  } catch (error) {
    console.error("Get Payment Intent Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve payment intent",
    });
  }
});

// Stripe Webhook Handler
app.post(
  "/api/v1/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET; // Add this to your .env file

    let event;

    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } else {
        event = JSON.parse(req.body);
      }
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);
        // Handle successful payment (update database, send confirmation email, etc.)
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);
        // Handle failed payment
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

// Your existing Google auth API
app.post("/api/auth/google", async (req, res) => {
  try {
    const { credential } = req.body;
    const ticket = await verify(credential);
    const payload = ticket.getPayload();

    const [rows] = await db.query("SELECT * FROM users WHERE google_id = ?", [
      payload.sub,
    ]);

    let user;
    if (rows.length > 0) {
      user = rows[0];
    } else {
      const [result] = await db.query(
        "INSERT INTO users (google_id, email, name, profile_image, role) VALUES (?, ?, ?, ?, ?)",
        [payload.sub, payload.email, payload.name, payload.picture, "user"]
      );
      const [newUser] = await db.query("SELECT * FROM users WHERE id = ?", [
        result.insertId,
      ]);
      user = newUser[0];
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET || "courier",
      { expiresIn: "24h" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_picture: user.profile_picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res
      .status(500)
      .json({ message: "Authentication failed", error: error.message });
  }
});

// Your existing Square API routes
app.post("/api/v1/customers", async (req, res) => {
  try {
    const response = await axios.post(
      "https://connect.squareup.com/v2/customers",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Square-Version": "2024-03-06",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Square API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: "Server error",
      error: error.response?.data || error.message,
    });
  }
});

app.post("/api/v1/customers/search", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const response = await axios.post(
      "https://connect.squareup.com/v2/customers/search",
      {
        query: {
          filter: {
            email_address: {
              exact: email,
            },
          },
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Square-Version": "2024-03-06",
        },
      }
    );

    if (response.data.customers && response.data.customers.length > 0) {
      res.json(response.data.customers[0]);
    } else {
      res.status(404).json({ message: "Customer not found" });
    }
  } catch (error) {
    console.error("Square API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: "Server error",
      error: error.response?.data || error.message,
    });
  }
});

app.post("/api/v1/cards", async (req, res) => {
  try {
    const { nonce, customerId } = req.body;
    const response = await axios.post(
      "https://connect.squareup.com/v2/cards",
      {
        source_id: nonce,
        idempotency_key: crypto.randomUUID(),
        card: {
          customer_id: customerId,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          "Square-Version": "2025-02-20",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Square API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: "Server error",
      error: error.response?.data || error.message,
    });
  }
});

// Your existing webhook

// Other existing routes
app.get("/api/current_user", (req, res) => {
  res.send(req.user);
});

app.get("/api/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/", (req, res) => {
  res.json({ message: "Hello From server with Stripe integration" });
});

// Database connection test route
app.get("/api/v1/test-db", async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();
    res.json({ status: "success", message: "Database connection successful" });
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
      code: error.code,
      details: "Check your Vercel logs for more info. Ensure IP whitelisting in Namecheap cPanel > Remote MySQL."
    });
  }
});

module.exports = app;
