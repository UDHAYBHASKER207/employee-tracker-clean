const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['not-started', 'in-progress', 'completed'],
      message: '{VALUE} is not a valid status',
    },
    default: 'not-started',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee', // Assuming projects are assigned to Employees
    required: [true, 'Assigned employee is required'],
  },
  // You might want to add who created the project or last updated it
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Project', projectSchema); 