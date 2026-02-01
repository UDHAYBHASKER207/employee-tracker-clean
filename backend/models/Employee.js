const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  hireDate: {
    type: String
  },
  salary: {
    type: Number,
    default: 1000,
    min: [0, 'Salary cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive'],
      message: '{VALUE} is not a valid status'
    },
    default: 'active'
  },
  image: {
    type: String,
    default: ''
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Add index for faster queries
// employeeSchema.index({ email: 1 }); // Removed duplicate index definition
employeeSchema.index({ userId: 1 });

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
