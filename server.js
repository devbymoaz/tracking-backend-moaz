const { db } = require("./db/index.js");
const app = require("./app.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Ensure required directories exist (Local dev only)
if (!process.env.VERCEL) {
  const dirs = [
    "uploads",
    "uploads/shipping_labels",
    "invoices",
    "saleinvoices"
  ];

  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      try {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } catch (err) {
        console.warn(`⚠️ Could not create directory ${dir}: ${err.message}`);
      }
    }
  });
}

// Test database connection before starting the server
if (require.main === module) {
  async function startServer() {
    try {
      const connection = await db.getConnection();
      console.log("✅ Connected to the database");
      connection.release();

      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    } catch (err) {
      console.error("❌ Error connecting to the database:", err);
      process.exit(1); // Exit if the database connection fails
    }
  }

  startServer();
}

module.exports = app;
