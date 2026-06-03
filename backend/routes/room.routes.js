const express = require('express');
const router = express.Router();
const { getAllRooms, bookRooms, randomOccupancy, resetAllRooms } = require('../controllers/room.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', getAllRooms);
router.post('/book', bookRooms);
router.post('/random', randomOccupancy);
router.post('/reset', resetAllRooms);

module.exports = router;
