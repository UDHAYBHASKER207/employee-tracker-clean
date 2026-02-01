const express = require('express');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all announcement routes
router.use(protect);

// Routes accessible by both admin and employees
router.route('/')
  .get(authorize(['admin', 'employee']), getAnnouncements);

router.route('/:id')
  .get(authorize(['admin', 'employee']), getAnnouncement);

// Routes accessible only by admin
router.route('/')
  .post(authorize(['admin']), createAnnouncement);

router.route('/:id')
  .put(authorize(['admin']), updateAnnouncement)
  .delete(authorize(['admin']), deleteAnnouncement);

module.exports = router; 