const { db } = require("../db/index");
const { ApiError } = require("../utils/ApiError");

const uploadRates = async (ratesData) => {
  try {
    // Perform the bulk insert
    const [result] = await db.query(
      `INSERT INTO rates 
        (zone, ship_from, ship_to, doc_half_kg, paket_1kg, paket_2kg, box_5kg, box_10kg, box_15kg, box_20kg, box_25kg, suitcase_10kg, suitcase_20kg, suitcase_30kg, days_envelop, days_parcel, insurance, rating, courier, service)
      VALUES ?`,
      [ratesData]
    );

    // Return the result of the insertion
    return result;
  } catch (error) {
    console.error("Database error:", error.message);
    throw error; // Rethrow the error so it can be handled by the caller
  }
};

const updateRates = async (
  id,
  doc_half_kg,
  paket_1kg,
  paket_2kg,
  box_5kg,
  box_10kg,
  box_15kg,
  box_20kg,
  box_25kg,
  suitcase_10kg,
  suitcase_20kg,
  suitcase_30kg,
  days_envelop,
  days_parcel,
  insurance,
  rating,
  courier,
  service
) => {
  try {
    const [result] = await db.query(
      `UPDATE rates 
        SET doc_half_kg = ?, paket_1kg = ?, paket_2kg = ?, box_5kg = ?, box_10kg = ?, box_15kg = ?, box_20kg = ?, box_25kg = ?, suitcase_10kg = ?, suitcase_20kg = ?, suitcase_30kg = ?,
        days_envelop = ?, days_parcel = ?,insurance = ?,rating = ?,courier = ?,service = ?
        WHERE id = ?`,
      [
        doc_half_kg,
        paket_1kg,
        paket_2kg,
        box_5kg,
        box_10kg,
        box_15kg,
        box_20kg,
        box_25kg,
        suitcase_10kg,
        suitcase_20kg,
        suitcase_30kg,
        days_envelop,
        days_parcel,
        insurance,
        rating,
        courier,
        service,
        id,
      ]
    );

    // Return the result of the update
    return result;
  } catch (error) {
    console.error("Database error:", error.message);
    throw error; // Rethrow the error so it can be handled by the caller
  }
};

// Mine Query
const getAllRates = async () => {
  try {
    // Fetch the rate details and apply markup calculation in the SQL query
    const [rateDetails] = await db.query(`
     SELECT 
    *,
    CASE
      WHEN markup_envelop IS NOT NULL AND markup_envelop != 0 THEN doc_half_kg + markup_envelop
      ELSE doc_half_kg
    END AS doc_half_kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN paket_1kg + markup_parcel
      ELSE paket_1kg
    END AS paket_1kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN paket_2kg + markup_parcel
      ELSE paket_2kg
    END AS paket_2kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN box_10kg + markup_parcel
      ELSE box_10kg
    END AS box_10kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN box_15kg + markup_parcel
      ELSE box_15kg
    END AS box_15kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN box_20kg + markup_parcel
      ELSE box_20kg
    END AS box_20kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN box_25kg + markup_parcel
      ELSE box_25kg
    END AS box_25kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN suitcase_10kg + markup_parcel
      ELSE suitcase_10kg
    END AS suitcase_10kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN suitcase_20kg + markup_parcel
      ELSE suitcase_20kg
    END AS suitcase_20kg,

    CASE
      WHEN markup_parcel IS NOT NULL AND markup_parcel != 0 THEN suitcase_30kg + markup_parcel
      ELSE suitcase_30kg
        END AS suitcase_30kg
      FROM rates
      WHERE doc_half_kg != 'no service'
      ORDER BY zone DESC
   `);

    // if (rateDetails?.length === 0) {
    //   throw new Error(`No rates found for zone`);
    // }

    // Return the fetched rows with the updated values
    return rateDetails;
  } catch (error) {
    console.error("Error fetching and updating rates:", error);
    throw new ApiError(
      500,
      "Database error occurred while retrieving and updating rates."
    );
  }
};

const findRateByZoneAndLocation = async (zone, ship_from, ship_to) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM rates WHERE zone = ? AND ship_from = ? AND ship_to = ?`,
      [zone, ship_from, ship_to]
    );

    // If a rate is found, return it
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Database error:", error.message);
    throw error; // Rethrow the error so it can be handled by the caller
  }
};

const updateMarkup = async (zone, category, markup) => {
  try {
    const nonServiceCondition = `
        doc_half_kg != 'no service' AND
        paket_1kg != 'no service' AND
        paket_2kg != 'no service' AND
        box_10kg != 'no service' AND
        box_15kg != 'no service' AND
        box_20kg != 'no service' AND
        box_25kg != 'no service' AND
        suitcase_10kg != 'no service' AND
        suitcase_20kg != 'no service' AND
        suitcase_30kg != 'no service'AND
        zone = ?
        `;

    if (!["markup_envelop", "markup_parcel"].includes(category)) {
      throw new Error(`Invalid category: ${category}`);
    }

    const roundedMarkup = parseFloat(markup).toFixed(2);

    let mysqlQuery = `
        UPDATE rates
        SET 
          ${category} = ? 
        WHERE ${nonServiceCondition}
      `;

    await db.query(mysqlQuery, [roundedMarkup, zone]);
    const updatedRates = await getAllRates();

    // Return the updated rates
    return updatedRates;
  } catch (error) {
    console.error("Error updating markup:", error, "Input Markup:", markup);
    throw new Error("Database error occurred while updating markup.");
  }
};

module.exports = {
  uploadRates,
  updateRates,
  findRateByZoneAndLocation,
  getAllRates,
  updateMarkup,
};
