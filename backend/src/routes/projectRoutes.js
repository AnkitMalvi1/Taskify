const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task'); // Add this import

// Get all projects for the authenticated user
router.get('/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single project
router.get('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id,
      owner: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks for a specific project
router.get('/projects/:id/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await Task.find({ project: req.params.id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new project
router.post('/projects', auth, async (req, res) => {
  try {
    const project = new Project({
      ...req.body,
      owner: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a project
router.patch('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a project
router.delete('/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;