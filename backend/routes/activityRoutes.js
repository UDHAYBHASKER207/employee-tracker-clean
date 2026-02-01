const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

// Routes for activities
router.get('/:employeeId', protect, getActivities);

module.exports = router; 