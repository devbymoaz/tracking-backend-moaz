const stripe = require("stripe")(
  "sk_test_51RfyUzCaxjfdI7d35mzcHKiGsj3pgdKQhKm4d0dAbzif4TwOzMavxoQTk1a1NQKFP3WZWPtzsurHTzdJxhELhogh00CPly7UWw"); // Replace with your actual secret key

async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { sourceId, amount, customerId } = req.body.data;

      // Create payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, 
        currency: "eur",
        customer: customerId,
        payment_method: sourceId, 
        confirm: true, // Auto-confirm the payment
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never",
        },
        return_url: "https://your-website.com/return", // Required when confirm=true
      });

      console.log(paymentIntent, "STRIPE RESULT");
      res.status(200).json(paymentIntent);
    } catch (error) {
      console.error("Stripe Payment Error:", error);
      res.status(500).json({
        error: error.message,
        type: error.type,
        code: error.code,
      });
    }
  } else {
    res.status(405).send("Method Not Allowed");
  }
}

module.exports = handler;
