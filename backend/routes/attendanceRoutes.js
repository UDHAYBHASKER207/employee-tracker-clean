const express = require('express');
const router = express.Router();
const { getAttendance, checkIn, checkOut } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');

// Attendance route
router.get('/:employeeId', protect, getAttendance);
router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);

module.exports = router; 