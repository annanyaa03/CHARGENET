const express = require('express');
const router = express.Router();
const { 
  startSession, 
  stopSession, 
  getMySessions 
} = require('../controllers/sessionController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.post('/start', startSession);
router.post('/stop', stopSession);
router.get('/my', getMySessions);

module.exports = router;
