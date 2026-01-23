const multer = require("multer");
const xlsx = require("xlsx");
const path = require("path");
const {
  uploadRates,
  findRateByZoneAndLocation,
  updateRates,
  getAllRates,
  updateMarkup,
} = require("../models/rates.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the folder where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage });

const uploadFileRates = asyncHandler(async (req, res, next) => {
  // Check if file exists
  if (!req.file) {
    return next(new ApiError(400, "No file uploaded"));
  }

  // Parse the Excel file
  const filePath = req.file.path;
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Assuming you are reading the first sheet
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // Convert sheet to an array of arrays

  // Validate that the data contains the required fields
  if (!data || data.length < 2) {
    return next(new ApiError(400, "No valid data found in the Excel file"));
  }

  // Extract headers and data
  const headers = data[0]; // First row as headers
  const rows = data.slice(1); // Remaining rows as data

  let insertData = [];
  let insertedObjects = [];
  for (const row of rows) {
    const rowObject = headers.reduce((acc, key, index) => {
      acc[key.trim()] = row[index] || null; // Map each column to the corresponding header
      return acc;
    }, {});

    // Map Excel headers to database column names
    const dbRowObject = {
      zone: rowObject["ZONE"],
      ship_from: rowObject["Ship From"] ? rowObject["Ship From"].trim() : null,
      ship_to: rowObject["Ship To"] ? rowObject["Ship To"].trim() : null,
      doc_half_kg: rowObject["Doc 0.5kg"],
      paket_1kg: rowObject["Paket 1kg"],
      paket_2kg: rowObject["Paket 2kg"],
      box_5kg: rowObject["Box 5kg"],
      box_10kg: rowObject["Box 10kg"],
      box_15kg: rowObject["Box 15kg"],
      box_20kg: rowObject["Box 20kg"],
      box_25kg: rowObject["Box 25kg"],
      suitcase_10kg: rowObject["Suitcase 10kg"],
      suitcase_20kg: rowObject["Suitcase 20kg"],
      suitcase_30kg: rowObject["Suitcase 30kg"],
      days_envelop: rowObject["Days ENV"],
      days_parcel: rowObject["Days PARCEL"],
      insurance: rowObject["Insurance"],
      rating: rowObject["Rating"],
      courier: rowObject["Courier"],
      service: rowObject["Service"],
    };

    // Skip rows with missing required fields
    if (!dbRowObject.zone || !dbRowObject.ship_to) {
      continue;
    }

    // Check if the rate already exists for this zone and ship_from, ship_to combination
    const existingRate = await findRateByZoneAndLocation(
      dbRowObject.zone,
      dbRowObject.ship_from,
      dbRowObject.ship_to
    );

    if (existingRate) {
      // If it exists, just update it

      await updateRates(
        existingRate.id,
        dbRowObject.doc_half_kg,
        dbRowObject.paket_1kg,
        dbRowObject.paket_2kg,
        dbRowObject.box_5kg,
        dbRowObject.box_10kg,
        dbRowObject.box_15kg,
        dbRowObject.box_20kg,
        dbRowObject.box_25kg,
        dbRowObject.suitcase_10kg,
        dbRowObject.suitcase_20kg,
        dbRowObject.suitcase_30kg,
        dbRowObject.days_envelop,
        dbRowObject.days_parcel,
        dbRowObject.insurance,
        dbRowObject.rating,
        dbRowObject.courier,
        dbRowObject.service
      );
      insertedObjects.push(dbRowObject); // Always push the object for update cases
    } else {
      // If not, prepare data for bulk insert and keep track of inserted rows

      insertData.push([
        dbRowObject.zone,
        dbRowObject.ship_from,
        dbRowObject.ship_to,
        dbRowObject.doc_half_kg,
        dbRowObject.paket_1kg,
        dbRowObject.paket_2kg,
        dbRowObject.box_5kg,
        dbRowObject.box_10kg,
        dbRowObject.box_15kg,
        dbRowObject.box_20kg,
        dbRowObject.box_25kg,
        dbRowObject.suitcase_10kg,
        dbRowObject.suitcase_20kg,
        dbRowObject.suitcase_30kg,
        dbRowObject.days_envelop,
        dbRowObject.days_parcel,
        dbRowObject.insurance,
        dbRowObject.rating,
        dbRowObject.courier,
        dbRowObject.service,
      ]);
      insertedObjects.push(dbRowObject); // Always push the object for new insertions
    }
  }

  // Insert all the data in bulk if there's anything to insert
  if (insertData.length > 0) {
    await uploadRates(insertData); // Bulk insert
  }

  // Return all inserted data (whether updated or inserted) as objects with DB column keys
  return res
    .status(201)
    .json(
      new ApiResponse(201, insertedObjects, "Rates uploaded successfully!")
    );
});

const fetchAllRates = asyncHandler(async (req, res, next) => {
  const data = await getAllRates();

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "All prices rates are fetched successfully")
    );
});

const updateRatesMarkup = asyncHandler(async (req, res, next) => {
  const { zone, category, markup } = req.body;

  if (!markup) {
    return res.status(400).json({ message: "Markup value is required." });
  }

  const result = await updateMarkup(zone, category, markup); // Call model function to update markup

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Markup updated successfully."));
});

module.exports = {
  uploadFileRates,
  upload,
  fetchAllRates,
  updateRatesMarkup,
};
