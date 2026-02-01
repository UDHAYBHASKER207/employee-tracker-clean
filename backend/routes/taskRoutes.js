const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask } = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

router.post('/', protect, adminOnly, createTask);
router.get('/', protect, getTasks);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);

module.exports = router; 