const { db } = require("../db");

async function insertParcelRate(rate) {
  console.log("Inserting parcel rate:", rate);
  const [result] = await db.query(
    `
    INSERT INTO parcel_rates (
      Type, ship_from, ship_to, ship_from_country, doc_half_kg, paket_1kg, paket_2kg,
      box_5kg, box_10kg, box_15kg, box_20kg, box_25kg,
      suitcase_10kg, suitcase_20kg, suitcase_30kg,
      days_envelop, days_parcel, insurance, rating, courier, service, elect_liquids
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      rate.Type,
      rate.ship_from,
      rate.ship_to,
      rate.ship_from_country,
      rate.doc_half_kg,
      rate.paket_1kg,
      rate.paket_2kg,
      rate.box_5kg,
      rate.box_10kg,
      rate.box_15kg,
      rate.box_20kg,
      rate.box_25kg,
      rate.suitcase_10kg,
      rate.suitcase_20kg,
      rate.suitcase_30kg,
      rate.days_envelop,
      rate.days_parcel,
      rate.insurance,
      rate.rating,
      rate.courier,
      rate.service,
      rate.elect_liquids,
    ]
  );
  return result;
}

async function findByCourier(courier, shipFromCountry) {
  const [rows] = await db.query(
    `
    SELECT * FROM parcel_rates 
    WHERE courier = ? AND ship_from_country = ?
    `,
    [courier, shipFromCountry]
  );

  return rows;
}

async function deleteParcelRatesByCourier(courier) {
  const [result] = await db.query(
    `DELETE FROM parcel_rates 
    WHERE courier = ?
    `,
    [courier]
  );
  return result;
}
async function deleteParcelRatesByCourierAndCountry(courier, shipFromCountry) {
  const [result] = await db.query(
    `
    DELETE FROM parcel_rates 
    WHERE courier = ? AND ship_from_country = ?
    `,
    [courier, shipFromCountry]
  );

  return result;
}
//parcel Rates
async function getAllParcelRates() {
  const [rows] = await db.query(`SELECT * FROM parcel_rates`);
  return rows;
}

module.exports = {
  insertParcelRate,
  findByCourier,
  deleteParcelRatesByCourier,
  getAllParcelRates,
  deleteParcelRatesByCourierAndCountry,
};
