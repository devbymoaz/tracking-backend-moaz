const multer = require("multer");
const path = require("path");
const fs = require("fs");
const os = require("os");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Use /tmp on Vercel/Serverless environments
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      cb(null, os.tmpdir());
    } else {
      // Local development
      const uploadDir = "./uploads";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

module.exports = { upload };
