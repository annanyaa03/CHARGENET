const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order
 */
const createOrder = async (amount, currency = 'INR', receipt) => {
  const options = {
    amount: amount * 100, // amount in the smallest currency unit (paise for INR)
    currency,
    receipt,
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 */
const verifySignature = (orderId, paymentId, signature) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + "|" + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
};

/**
 * Refund a payment
 */
const refundPayment = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
    });
    return refund;
  } catch (error) {
    console.error('Razorpay Refund Error:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  verifySignature,
  refundPayment,
};
