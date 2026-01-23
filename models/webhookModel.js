const { db } = require("../db");

const createLog = async (logData) => {
  try {
    const mysqlQuery = `INSERT INTO logs (log) VALUES (?)`;

    const [result] = await db.query(mysqlQuery, [JSON.stringify(logData)]);
    return {
      id: result.insertId,
      log: logData,
    };
  } catch (error) {
    console.error("Error inserting log:", error);
    throw new Error("Database error occurred while inserting log.");
  }
};

module.exports = {
  createLog,
};
