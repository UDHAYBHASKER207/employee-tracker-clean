const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Employee = require('../models/Employee');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private (Admin, Employee)
const getProjects = asyncHandler(async (req, res) => {
  // If user is employee, only show projects assigned to them
  let query = {};
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      res.status(404);
      throw new Error('Employee profile not found');
    }
    query = { assignedTo: employee._id };
  }

  const projects = await Project.find(query).populate('assignedTo', 'firstName lastName');
  res.status(200).json(projects);
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private (Admin, Employee)
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('assignedTo', 'firstName lastName');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // If user is employee, ensure they are assigned to this project or are an admin
  if (req.user.role === 'employee') {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee || project.assignedTo._id.toString() !== employee._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view this project');
    }
  }

  res.status(200).json(project);
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin only)
const createProject = asyncHandler(async (req, res) => {
  const { name, description, dueDate, status, assignedTo } = req.body;

  if (!name || !dueDate || !assignedTo) {
    res.status(400);
    throw new Error('Please add all required fields: name, due date, assigned employee');
  }

  const project = await Project.create({
    name,
    description,
    dueDate,
    status,
    assignedTo,
    createdBy: req.user._id, // Assign the user who created it
  });

  res.status(201).json(project);
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, dueDate, status, assignedTo } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.name = name || project.name;
  project.description = description || project.description;
  project.dueDate = dueDate || project.dueDate;
  project.status = status || project.status;
  project.assignedTo = assignedTo || project.assignedTo;
  
  const updatedProject = await project.save();

  res.status(200).json(updatedProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await project.deleteOne();

  res.status(200).json({ message: 'Project removed' });
});

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
}; 