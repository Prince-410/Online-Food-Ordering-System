const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');

// ─── POST /api/payment/create-order ──────────────────────────────────────────
// Called BEFORE placing the order — creates a Razorpay order to get the orderId
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body; // in paise (rupees × 100), e.g. ₹299 → 29900

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(amount),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        });

        res.status(200).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error('Razorpay create order error:', err);
        res.status(500).json({ message: 'Failed to create payment order', error: err.message });
    }
};

// ─── POST /api/payment/verify ─────────────────────────────────────────────────
// Called AFTER Razorpay checkout succeeds — verifies signature & marks order paid
const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
            return res.status(400).json({ message: 'Missing payment verification fields' });
        }

        // HMAC-SHA256 signature check
        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (expectedSig !== razorpaySignature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed: signature mismatch' });
        }

        // Mark order as paid in DB
        const order = await Order.findOneAndUpdate(
            { _id: orderId, user: req.user._id },
            {
                'payment.status': 'paid',
                'payment.razorpayOrderId': razorpayOrderId,
                'payment.razorpayPaymentId': razorpayPaymentId,
                'payment.razorpaySignature': razorpaySignature,
                'payment.paidAt': new Date(),
                orderStatus: 'confirmed',
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ success: true, message: 'Payment verified', order });
    } catch (err) {
        console.error('Payment verify error:', err);
        res.status(500).json({ message: 'Verification failed', error: err.message });
    }
};

module.exports = { createRazorpayOrder, verifyPayment };
