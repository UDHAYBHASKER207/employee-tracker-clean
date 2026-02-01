const Employee = require('../models/Employee');
const User = require('../models/User');
const mongoose = require('mongoose'); // Import mongoose to use isValidObjectId
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const path = require('path');
const fs = require('fs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({});
    res.json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid employee ID format' });
    }

    const employee = await Employee.findById(req.params.id);
    
    if (employee) {
      res.json(employee);
    } else {
      res.status(404).json({ message: 'Employee not found' });
    }
  } catch (error) {
    console.error(error);
    // For any other unexpected server errors
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private/Admin
const addEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate,
      salary,
      status,
      userId
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !department) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: 'First name, last name, email, and department are required'
      });
    }

    // Check if employee with this email already exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: 'Employee already exists with this email' });
    }

    // Create new employee
    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate,
      salary: salary || 0,
      status: status || 'active',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      userId
    });

    if (employee) {
      res.status(201).json(employee);
    } else {
      res.status(400).json({ message: 'Invalid employee data' });
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate entry',
        details: 'An employee with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ 
      message: 'Server error while creating employee',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin or Employee updating their own profile)
const updateEmployee = async (req, res) => {
  try {
    console.log('Update employee request received:', {
      params: req.params,
      body: req.body,
      file: req.file
    });

    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Authorization check
    // Admins can update any employee. Employees can only update their own profile.
    if (req.user.role !== 'admin' && employee.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this employee profile' });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate,
      salary,
      status
    } = req.body;

    // Check if updating email to one that already exists
    if (email && email !== employee.email) {
      const emailExists = await Employee.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another employee' });
      }
    }

    // Update fields if they are provided in the request
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (email) employee.email = email;
    if (phone) employee.phone = phone;
    if (department) employee.department = department;
    if (position) employee.position = position;
    if (hireDate) employee.hireDate = hireDate;
    if (salary) employee.salary = salary;
    if (status) employee.status = status;
    
    // Handle image upload
    if (req.file) {
      console.log('New image uploaded:', req.file);
      // Remove old image if it exists
      if (employee.image) {
        const oldImagePath = path.join(__dirname, '../../uploads', path.basename(employee.image));
        try {
          fs.unlinkSync(oldImagePath);
          console.log('Old image removed:', oldImagePath);
        } catch (err) {
          console.error('Error removing old image:', err);
        }
      }
      employee.image = `/uploads/${req.file.filename}`;
    }

    console.log('Employee object before save:', employee);

    const updatedEmployee = await employee.save();
    console.log('Employee updated successfully:', updatedEmployee);

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Employee not found' });
    } else {
      res.status(500).json({ 
        message: 'Server error while updating employee',
        error: error.message
      });
    }
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Find and update any user associated with this employee
    await User.updateMany(
      { employeeId: employee._id },
      { $unset: { employeeId: "" } }
    );

    // Delete the employee
    await Employee.deleteOne({ _id: employee._id });
    
    res.json({ message: 'Employee removed' });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Employee not found' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// @desc    Get attendance for an employee
// @route   GET /api/attendance/:employeeId
// @access  Private
const getAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    const records = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
};

// @desc    Get current user's employee record
// @route   GET /api/employees/me
// @access  Private
const getCurrentEmployee = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Admin assigns a task to an employee
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const assignedBy = req.user._id;
    const task = await Task.create({ title, description, assignedTo, assignedBy, dueDate });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create task' });
  }
};

// @desc    Get all tasks or tasks for a specific employee
// @route   GET /api/tasks or /api/tasks?assignedTo=employeeId
// @access  Private
const getTasks = async (req, res) => {
  try {
    let filter = {};
    if (req.query.assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(req.query.assignedTo)) {
        // Instead of returning a 400 error, just return an empty array
        return res.json([]);
      }
      filter.assignedTo = req.query.assignedTo;
    }
    const tasks = await Task.find(filter).populate('assignedTo', 'firstName lastName').populate('assignedBy', 'firstName lastName');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'firstName lastName').populate('assignedBy', 'firstName lastName');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (employee or admin)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Only allow updating status (or add more fields as needed)
    if (req.body.status) task.status = req.body.status;
    if (req.body.title) task.title = req.body.title;
    if (req.body.description) task.description = req.body.description;
    if (req.body.dueDate) task.dueDate = req.body.dueDate;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update task' });
  }
};

// @desc    Employee checks in
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
  try {
    const employeeId = req.body.employeeId;
    const date = req.body.date || new Date().toISOString().split('T')[0];
    const checkInTime = req.body.checkIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    let attendance = await Attendance.findOne({ employee: employeeId, date });
    if (!attendance) {
      attendance = new Attendance({ employee: employeeId, date, checkIn: checkInTime, status: 'present' });
    } else {
      attendance.checkIn = checkInTime;
      attendance.status = 'present';
    }
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to check in' });
  }
};

// @desc    Employee checks out
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
  try {
    const employeeId = req.body.employeeId;
    const date = req.body.date || new Date().toISOString().split('T')[0];
    const checkOutTime = req.body.checkOut || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: 'Invalid employee ID format' });
    }
    let attendance = await Attendance.findOne({ employee: employeeId, date });
    if (!attendance) {
      attendance = new Attendance({ employee: employeeId, date, checkOut: checkOutTime, status: 'present' });
    } else {
      attendance.checkOut = checkOutTime;
      attendance.status = 'present';
    }
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Failed to check out' });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  getAttendance,
  getCurrentEmployee,
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  checkIn,
  checkOut,
};
