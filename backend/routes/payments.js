const express = require('express');
const router = express.Router();
const { 
  createPaymentOrder, 
  verifyPayment, 
  processRefund,
  getPaymentHistory 
} = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);
router.post('/refund', processRefund);
router.get('/history', getPaymentHistory);

module.exports = router;
