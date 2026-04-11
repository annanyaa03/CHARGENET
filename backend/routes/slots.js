const express = require('express');
const router = express.Router();
const { 
  getSlots, 
  getAvailableSlots, 
  updateSlotStatus 
} = require('../controllers/slotController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/:stationId', getSlots);
router.get('/:stationId/available', getAvailableSlots);

// Protected routes (Owner and Admin only)
router.patch('/:id/status', protect, authorize('station_owner', 'admin'), updateSlotStatus);

module.exports = router;
