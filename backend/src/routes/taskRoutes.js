const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');

// Create a new task
router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get tasks for a project
router.get('/projects/:projectId/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task
router.patch('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      assignedTo: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'status'];
    updates.forEach(update => {
      if (allowedUpdates.includes(update)) {
        task[update] = req.body[update];
      }
    });
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id,
      assignedTo: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;