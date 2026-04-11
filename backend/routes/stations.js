const express = require('express');
const router = express.Router();
const { 
  getStations, 
  getStation, 
  createStation, 
  updateStation, 
  deleteStation,
  getMyStations 
} = require('../controllers/stationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getStations);
router.get('/:id', getStation);

// Protected routes (Owner and Admin only)
router.use(protect);

router.get('/owner/my', authorize('station_owner', 'admin'), getMyStations);
router.post('/', authorize('station_owner', 'admin'), createStation);
router.put('/:id', authorize('station_owner', 'admin'), updateStation);
router.delete('/:id', authorize('station_owner', 'admin'), deleteStation);

module.exports = router;
