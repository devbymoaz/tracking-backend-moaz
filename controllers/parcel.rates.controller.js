const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const {
  insertParcelRate,
  findByCourier,
  deleteParcelRatesByCourier,
  getAllParcelRates,
  deleteParcelRatesByCourierAndCountry,
} = require("../models/parcel.rates.model");

exports.uploadParcelRates = async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "CSV file is required" });

  if (!req.body.ship_from_country)
    return res.status(400).json({ message: "Ship from country is required" });

  const filePath = path.join(__dirname, "..", "uploads", req.file.filename);
  const results = [];
  const ship_from_country = req.body.ship_from_country;

  // Track statistics for the response
  const stats = {
    created: 0,
    updated: 0,
  };

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      results.push({
        Type: row["Type"],
        ship_from: row["Ship From"] || row["Ship From "],
        ship_to: row["Ship To"],
        ship_from_country: ship_from_country, // Add the new field
        doc_half_kg: row["Doc 0.5kg"] || 0,
        paket_1kg: row["Paket 1kg"] || 0,
        paket_2kg: row["Paket 2kg"] || 0,
        box_5kg: row["Box 5kg"] || 0,
        box_10kg: row["Box 10kg"] || 0,
        box_15kg: row["Box 15kg"] || 0,
        box_20kg: row["Box 20kg"] || 0,
        box_25kg: row["Box 25kg"] || 0,
        suitcase_10kg: row["Suitcase 10kg"] || 0,
        suitcase_20kg: row["Suitcase 20kg"] || 0,
        suitcase_30kg: row["Suitcase 30kg"] || 0,
        days_envelop: row["Days ENV"] || 0,
        days_parcel: row["Days PARCEL"] || 0,
        insurance: row["Insurance"],
        rating: row["Rating"] || 0,
        courier: row["Courier"],
        service: row["Service"],
        elect_liquids: row["Electronics & Any Liquids"],
      });
    })
    .on("end", async () => {
      try {
        const courierGroups = {};

        for (const rate of results) {
          if (!courierGroups[rate.courier]) {
            courierGroups[rate.courier] = [];
          }
          courierGroups[rate.courier].push(rate);
        }

        // Process each courier group
        for (const courier in courierGroups) {
          // Check if any rates for this courier already exist
          const existingRates = await findByCourier(courier, ship_from_country);
          if (existingRates.length > 0) {
            // If courier exists, delete all existing records for this courier
            await deleteParcelRatesByCourierAndCountry(
              courier,
              ship_from_country
            );
          }

          // Insert all new rates for this courier
          for (const rate of courierGroups[courier]) {
            await insertParcelRate(rate);
            existingRates.length > 0 ? stats.updated++ : stats.created++;
          }
        }

        res.status(200).json({
          message: `CSV processed successfully. Created: ${stats.created}, Updated: ${stats.updated} records.`,
          data: results,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error saving data to DB" });
      }
    });
};
exports.getAllRates = async (req, res) => {
  try {
    const rates = await getAllParcelRates();
    res.status(200).json({
      success: true,
      count: rates.length,
      data: rates,
    });
  } catch (err) {
    console.error("Error fetching parcel rates:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching parcel rates",
    });
  }
};

exports.getAllRatesByCourier = async (req, res) => {
  const { courier, country } = req.params;
  try {
    const rates = await findByCourier(courier, country);
    res.status(200).json({
      success: true,
      count: rates.length,
      data: rates,
    });
  } catch (err) {
    console.error("Error fetching parcel rates:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching parcel rates",
    });
  }
};

exports.deleteRatesByCourier = async (req, res) => {
  const { courier, country } = req.params;
  try {
    const rates = await deleteParcelRatesByCourierAndCountry(courier, country);
    res.status(200).json({
      success: true,
      count: rates.length,
      data: rates,
    });
  } catch (err) {
    console.error("Error fetching parcel rates:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching parcel rates",
    });
  }
};
