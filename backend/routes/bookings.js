const express = require('express');
const router = express.Router();
const { 
 
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBooking);
router.patch('/:id/cancel', cancelBooking);
router.get('/station/:stationId', authorize('station_owner', 'admin'), getStationBookings);

module.exports = router;
