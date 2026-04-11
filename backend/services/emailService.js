const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send booking confirmation email
 */
const sendBookingConfirmation = async (email, bookingDetails) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Confirmed - ChargeNet',
    html: `
      <h1>Booking Confirmed!</h1>
      <p>Your charging slot has been successfully booked.</p>
      <ul>
        <li><strong>Station:</strong> ${bookingDetails.stationName}</li>
        <li><strong>Date:</strong> ${bookingDetails.scheduled_date}</li>
        <li><strong>Time:</strong> ${bookingDetails.start_time} - ${bookingDetails.end_time}</li>
        <li><strong>Slot:</strong> ${bookingDetails.slot_number}</li>
      </ul>
      <p>Thank you for using ChargeNet!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send payment receipt email
 */
const sendPaymentReceipt = async (email, transactionDetails) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Payment Receipt - ChargeNet',
    html: `
      <h1>Payment Received</h1>
      <p>Thank you for your payment.</p>
      <ul>
        <li><strong>Amount:</strong> ₹${transactionDetails.amount}</li>
        <li><strong>Transaction ID:</strong> ${transactionDetails.razorpay_payment_id}</li>
        <li><strong>Order ID:</strong> ${transactionDetails.razorpay_order_id}</li>
      </ul>
      <p>Keep charging with ChargeNet!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Payment receipt sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Send cancellation email
 */
const sendCancellationEmail = async (email, bookingDetails) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Booking Cancelled - ChargeNet',
    html: `
      <h1>Booking Cancelled</h1>
      <p>Your booking for ${bookingDetails.stationName} on ${bookingDetails.scheduled_date} has been cancelled.</p>
      <p>If you were eligible for a refund, it will be processed shortly.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendCancellationEmail,
};
