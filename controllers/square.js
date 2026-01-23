const { Client } = require("square");
const { randomUUID } = require("crypto");

const { paymentsApi } = new Client({
   accessToken:"EAAAl6wECqNFufjB3Nv0hbekrOBNoESwcXuOfOO5R9pFi8PVV7ZgfB8UAaf2fDso",
   environment: "production",
  // SANDBOX
//   accessToken:
//     "EAAAl8y4pnLtbm9fwZElzTXozYLk85fjT0FN40SobwUg3wuIwcxziLrcKgJXbAqo",
//   environment: "sandbox",
});

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { sourceId, amount, customerId } = req.body;

      const amountInCents = Math.round(parseFloat(amount) * 100);

      const { result } = await paymentsApi.createPayment({
        idempotencyKey: randomUUID(),
        sourceId,
        amountMoney: {
          currency: "EUR",
          amount: amountInCents, // must be integer
        },
        customerId,
        autocomplete: true,
      });

      const safeResult = JSON.parse(
        JSON.stringify(result, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      console.log(safeResult, "RESULTTTTT");
      res.status(200).json(safeResult);
    } catch (error) {
      console.error("Payment Error:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

module.exports = handler;
