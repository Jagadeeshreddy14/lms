import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { price, currency, courseId } = req.body;
    if (!price || !currency || !courseId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency,
          product_data: { name: `Course ${courseId}` },
          unit_amount: price,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: 'https://yourdomain.com/success',
      cancel_url: 'https://yourdomain.com/cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ message: err.message || 'Checkout session failed.' });
  }
});

export default router;