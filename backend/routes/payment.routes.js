const express = require("express");
const router = express.Router();
// Initialize stripe with the secret key from environment variables
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
    try {
        const { amount, currency = "inr" } = req.body;

        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in smallest currency unit (paise for INR)
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error("Error creating payment intent:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
