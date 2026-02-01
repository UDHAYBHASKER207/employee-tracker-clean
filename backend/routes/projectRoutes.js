const express = require('express');
const { 
  getProjects, 
  createProject, 
  getProjectById, 
  updateProject, 
  deleteProject 
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all project routes and ensure only admins can manage projects
router.route('/')
  .get(protect, authorize(['admin', 'employee']), getProjects) // Employees can view, only admins can manage
  .post(protect, authorize(['admin']), createProject);

router.route('/:id')
  .get(protect, authorize(['admin', 'employee']), getProjectById) // Employees can view their assigned projects
  .put(protect, authorize(['admin']), updateProject)
  .delete(protect, authorize(['admin']), deleteProject);

module.exports = router; 