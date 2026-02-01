const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: String }, // e.g., '09:00 AM'
  checkOut: { type: String }, // e.g., '05:30 PM'
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
}, { timestamps: true });

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema); 