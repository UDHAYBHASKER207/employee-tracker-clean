const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  type: {
    type: String,
    enum: ['login', 'profile_update', 'task_completed', 'attendance_checkin', 'attendance_checkout', 'password_change', 'admin_action'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

activitySchema.index({ employee: 1, date: -1 });

module.exports = mongoose.model('Activity', activitySchema); 