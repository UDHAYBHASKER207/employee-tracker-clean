const Announcement = require('../models/Announcement');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all announcements
// @route   GET /api/v1/announcements
// @access  Private (Admin, Employee)
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  const announcements = await Announcement.find({ isActive: true })
    .populate('createdBy', 'name')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: announcements.length,
    data: announcements
  });
});

// @desc    Get single announcement
// @route   GET /api/v1/announcements/:id
// @access  Private (Admin, Employee)
exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('createdBy', 'name');

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Create new announcement
// @route   POST /api/v1/announcements
// @access  Private (Admin only)
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const announcement = await Announcement.create(req.body);

  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Update announcement
// @route   PUT /api/v1/announcements/:id
// @access  Private (Admin only)
exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete announcement
// @route   DELETE /api/v1/announcements/:id
// @access  Private (Admin only)
exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404));
  }

  // Instead of deleting, we'll set isActive to false
  announcement.isActive = false;
  await announcement.save();

  res.status(200).json({
    success: true,
    data: {}
  });
}); 