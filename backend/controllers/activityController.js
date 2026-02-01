const Activity = require('../models/Activity');
const Employee = require('../models/Employee');

// @desc    Record a new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async ({ employeeId, type, message }) => {
  try {
    if (!employeeId || !type || !message) {
      console.error('Missing required fields for activity logging');
      return;
    }
    const activity = await Activity.create({
      employee: employeeId,
      type,
      message,
    });
    console.log('Activity logged:', activity);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// @desc    Get activities for an employee
// @route   GET /api/activities/:employeeId
// @access  Private
const getActivities = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const activities = await Activity.find({ employee: employeeId }).sort({ date: -1 }).limit(10); // Get last 10 activities
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
};

module.exports = {
  createActivity,
  getActivities,
}; 