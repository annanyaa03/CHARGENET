const { supabase, supabaseAdmin } = require('../config/supabase');
const { createOrder, verifySignature, refundPayment } = require('../services/razorpayService');
const { sendPaymentReceipt } = require('../services/emailService');

/**
 * @desc    Create Razorpay order for a booking
 * @route   POST /api/payments/create-order
 * @access  Private
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    // 1. Fetch booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user_id !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // 2. Create Razorpay order
    const order = await createOrder(booking.total_amount, 'INR', booking_id);

    // 3. Create transaction record (Pending)
    const { error: transError } = await supabaseAdmin
      .from('transactions')
      .insert([{
        booking_id: booking.id,
        user_id: req.user.id,
        amount: booking.total_amount,
        razorpay_order_id: order.id,
        status: 'pending'
      }]);

    if (transError) throw transError;

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify Razorpay payment
 * @route   POST /api/payments/verify
 * @access  Private
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Verify Signature
    const isVerified = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isVerified) {
      // Update transaction to failed
      await supabaseAdmin
        .from('transactions')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // 2. Update Transaction
    const { data: transaction, error: transError } = await supabaseAdmin
      .from('transactions')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'success'
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single();

    if (transError) throw transError;

    // 3. Update Booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({
        payment_status: 'paid',
        status: 'confirmed'
      })
      .eq('id', transaction.booking_id)
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 4. Send Confirmation Email
    sendPaymentReceipt(req.user.email, {
        amount: transaction.amount,
        razorpay_payment_id,
        razorpay_order_id
    });

    res.status(200).json({
      success: true,
      message: 'Payment verified and booking confirmed',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Initiate refund for cancelled booking
 * @route   POST /api/payments/refund
 * @access  Private
 */
const processRefund = async (req, res, next) => {
  try {
    const { booking_id } = req.body;

    // 1. Check if booking is cancelled and paid
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.status !== 'cancelled' || booking.payment_status !== 'paid') {
        return res.status(400).json({ success: false, message: 'Booking not eligible for refund' });
    }

    // 2. Find the successful transaction
    const { data: transaction, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('booking_id', booking_id)
      .eq('status', 'success')
      .single();

    if (transError || !transaction) {
        return res.status(404).json({ success: false, message: 'Transaction not found or not successful' });
    }

    // 3. Process Refund through Razorpay
    const refund = await refundPayment(transaction.razorpay_payment_id, transaction.amount);

    // 4. Update status in Database
    await supabaseAdmin
        .from('transactions')
        .update({ status: 'refunded' })
        .eq('id', transaction.id);

    await supabaseAdmin
        .from('bookings')
        .update({ payment_status: 'refunded' })
        .eq('id', booking_id);

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: refund
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction history
 * @route   GET /api/payments/history
 * @access  Private
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, bookings(scheduled_date, stations(name))')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  processRefund,
  getPaymentHistory
};
