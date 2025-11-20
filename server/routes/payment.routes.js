import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/authMiddleaare.js';
import { userPurchaseCourse } from '../controllers/user.controllers.js';


const paymentRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';


// Create Stripe Checkout Session
paymentRouter.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const { courseId, courseName, coursePrice, courseImage } = req.body;
    console.log('Received:', req.body);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe key not configured.' });
    }
    // Required fields check
    if (!courseId || !courseName) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    // Price validation
    let amount = 0;
    if (typeof coursePrice !== 'undefined') {
      amount = parseInt(coursePrice, 10);
    }

    // Free or missing price logic
    if (typeof coursePrice === 'undefined' || isNaN(amount) || amount <= 0) {
      console.log('Free or missing/invalid price detected — enrolling user directly', { userId: req.user.userId, courseId });

      const purchaseReq = {
        params: { courseId },
        user: { userId: req.user.userId },
        body: { sessionId: null, paymentMethod: 'free' }
      };

      let purchaseResult = null;
      let purchaseStatus = 200;
      const mockRes = {
        status: (code) => {
          purchaseStatus = code;
          return { json: (data) => { purchaseResult = data; return data; } };
        }
      };

      try {
        await userPurchaseCourse(purchaseReq, mockRes);
        if (purchaseStatus === 200 && purchaseResult?.success) {
          return res.status(200).json({ success: true, message: 'Enrolled successfully (free course)', purchase: purchaseResult.purchase });
        }
        return res.status(400).json({ success: false, message: purchaseResult?.message || 'Failed to enroll in free course' });
      } catch (err) {
        console.error('Error enrolling free course:', err);
        return res.status(500).json({ success: false, message: 'Internal error while enrolling' });
      }
    }

    if (amount > 0 && Number.isInteger(amount)) {
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: [
            {
              price_data: {
                currency: 'inr',
                product_data: {
                  name: courseName,
                  images: courseImage ? [courseImage] : undefined,
                },
                unit_amount: amount, // in paise
              },
              quantity: 1,
            },
          ],
          metadata: {
            courseId,
            userId: req.user.userId,
          },
          success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
          cancel_url: `${FRONTEND_URL}/course/${courseId}`,
        });

        return res.status(200).json({ success: true, url: session.url, id: session.id });
      } catch (stripeErr) {
        console.error('Stripe session creation error:', stripeErr);
        return res.status(500).json({
          message: 'Failed to create checkout session',
          error: stripeErr.message || 'Stripe session creation failed.',
          requestData: { courseId, courseName, coursePrice, courseImage, amount }
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid price for payment. Must be an integer amount in paise > 0.',
        amount
      });
    }
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    res.status(500).json({ message: err.message || 'Checkout session failed.' });
  }
});

// Verify checkout session and complete purchase
paymentRouter.post('/verify-session', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const { userId } = req.user;

    console.log('Verifying payment session:', sessionId, 'for user:', userId);

    // Validate input
    if (!sessionId) {
      console.log('Session ID missing in request body');
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    // Retrieve Stripe session
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log('Stripe session retrieved. Payment status:', session.payment_status);
      console.log('Session metadata:', session.metadata);
    } catch (stripeError) {
      console.log('Stripe session retrieval error:', stripeError.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid session ID or session not found'
      });
    }
    
    if (session.payment_status === 'paid') {
      const courseId = session.metadata.courseId;
      
      if (!courseId) {
        console.log('Course ID missing in session metadata');
        return res.status(400).json({
          success: false,
          message: 'Course ID not found in payment session'
        });
      }
      
      console.log('Payment verified successfully, processing purchase for course:', courseId);
      
      // Process the purchase by calling the purchase controller
      const purchaseReq = {
        params: { courseId },
        user: { userId },
        body: { sessionId, paymentMethod: 'stripe' }
      };
      
      // Create a mock response object to capture the purchase result
      let purchaseResult = null;
      let purchaseStatus = 200;
      
      const mockRes = {
        status: (code) => {
          purchaseStatus = code;
          return {
            json: (data) => {
              purchaseResult = data;
              return data;
            }
          };
        }
      };
      
      // Call the purchase controller
      try {
        await userPurchaseCourse(purchaseReq, mockRes);
        
        if (purchaseStatus === 200 && purchaseResult?.success) {
          res.status(200).json({
            success: true,
            session: session,
            courseId: courseId,
            purchase: purchaseResult.purchase,
            message: 'Payment verified and purchase completed successfully'
          });
        } else {
          console.log('Purchase processing failed. Status:', purchaseStatus, 'Result:', purchaseResult);
          res.status(400).json({
            success: false,
            message: purchaseResult?.message || 'Failed to complete purchase',
          });
        }
      } catch (purchaseError) {
        console.log('Purchase controller error:', purchaseError.message);
        res.status(500).json({
          success: false,
          message: 'Internal error during purchase processing'
        });
      }
    } else {
      console.log('Payment not completed. Status:', session.payment_status);
      res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${session.payment_status}`,
        paymentStatus: session.payment_status
      });
    }
  } catch (error) {
    console.log('Verify Session Error:', error.message);
    console.log('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during payment verification',
      error: error.message 
    });
  }
});

// Webhook to handle successful payments
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`  Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const courseId = session.metadata.courseId;
      
      console.log('Payment successful for course:', courseId);
      console.log('Session ID:', session.id);
      console.log('Customer Email:', session.customer_details.email);
      
      
      
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

export default paymentRouter;
