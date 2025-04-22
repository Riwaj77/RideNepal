import express from 'express';
import axios from 'axios';
import Payment from '../Model/Payment.js';
import { initializeKhaltiPayment, verifyKhaltiPayment } from '../services/khalti.js';

const router = express.Router();

// Create payment
router.post('/', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const payment = await Payment.create({
      userId,
      amount,
      pidx: `payment-${Date.now()}`,
      status: 'pending'
    });

    res.json(payment);
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Initialize payment
router.post("/initialize", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    // Generate a temporary unique ID
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Create a payment record with temporary pidx
    const payment = await Payment.create({
      userId,
      amount: amount * 100, // Convert to paisa
      pidx: tempId, // Use temporary unique identifier
      paymentGateway: "khalti",
      status: "pending"
    });

    // Initialize Khalti payment
    const paymentInitiate = await initializeKhaltiPayment({
      amount: amount * 100,
      purchase_order_id: payment._id,
      purchase_order_name: "Wallet Recharge",
      return_url: `${process.env.BACKEND_URI}/api/payments/verify`,
      website_url: process.env.FRONTEND_URI
    });

    // Update payment with the real pidx from Khalti
    payment.pidx = paymentInitiate.pidx;
    await payment.save();

    res.json({
      success: true,
      payment,
      paymentInitiate
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify payment
router.get("/verify", async (req, res) => {
  const {
    pidx,
    txnId,
    amount,
    mobile,
    purchase_order_id,
    purchase_order_name,
    transaction_id,
  } = req.query;

  try {
    const paymentInfo = await verifyKhaltiPayment(pidx);

    // Check if payment is completed and details match
    if (
      paymentInfo?.status !== "Completed" ||
      paymentInfo.transaction_id !== transaction_id ||
      Number(paymentInfo.total_amount) !== Number(amount)
    ) {
      // Redirect with error message if verification fails
      return res.redirect(`${process.env.FRONTEND_URI}/wallet?status=error&message=Payment verification failed`);
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { pidx },
      {
        $set: {
          status: "success",
          transactionId: transaction_id,
          dataFromVerificationReq: paymentInfo,
          apiQueryFromUser: req.query,
        },
      },
      { new: true }
    );

    if (!payment) {
      // Redirect with error message if payment record not found
      return res.redirect(`${process.env.FRONTEND_URI}/wallet?status=error&message=Payment record not found`);
    }

    // Success! Redirect to wallet with success message and amount
    const amountInRupees = Number(amount) / 100; // Convert paisa to rupees
    return res.redirect(
      `${process.env.FRONTEND_URI}/wallet?status=success&amount=${amountInRupees}&transaction_id=${transaction_id}`
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    // Redirect with error message on exception
    return res.redirect(
      `${process.env.FRONTEND_URI}/wallet?status=error&message=${encodeURIComponent(error.message || 'An error occurred during payment verification')}`
    );
  }
});

// Get payment history
router.get("/history/:userId", async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Deduct from wallet
router.post("/deduct", async (req, res) => {
  try {
    const { userId, amount, rideId } = req.body;
    const amountInPaisa = amount * 100; // Convert rupees to paisa

    // Get user's wallet balance
    const payments = await Payment.find({ userId });
    const balanceInPaisa = payments
      .filter(payment => payment.status === 'success')
      .reduce((sum, payment) => {
        if (payment.paymentType === 'load') {
          // Add wallet loads
          return sum + payment.amount;
        } else if (payment.paymentType === 'ride' && payment.paymentGateway === 'wallet') {
          // Subtract ride payments
          return sum - payment.amount;
        }
        return sum;
      }, 0);

    // Check if balance is sufficient (compare in paisa)
    if (balanceInPaisa < amountInPaisa) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    // Generate a unique transaction ID for the ride payment
    const ridePaymentId = `ride-${rideId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Create ride payment record (store in paisa)
    const payment = await Payment.create({
      userId,
      amount: amountInPaisa,
      rideId,
      pidx: ridePaymentId,
      paymentGateway: "wallet",
      paymentType: "ride",
      status: "success"
    });

    // Calculate new balance (in rupees)
    const newBalance = (balanceInPaisa - amountInPaisa) / 100;

    res.json({
      success: true,
      message: "Payment successful",
      payment,
      remainingBalance: newBalance
    });
  } catch (error) {
    console.error("Wallet payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message
    });
  }
});

export default router; 