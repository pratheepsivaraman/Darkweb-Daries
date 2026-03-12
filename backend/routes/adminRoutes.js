const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Level = require('../models/Level');
const Submission = require('../models/Submission');
const { protect, admin } = require('../middlewares/authMiddleware');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', [protect, admin], async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Reset user progress
// @route   PUT /api/admin/users/:id/reset
// @access  Private/Admin
router.put('/users/:id/reset', [protect, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.currentLevel = 1;
    user.totalPoints = 0;
    user.completedLevels = [];
    user.puzzleSolved = false;
    await user.save();

    // Also delete their submissions
    await Submission.deleteMany({ userId: user._id });

    res.json({ message: 'User progress reset' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', [protect, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
       return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
       return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    await User.deleteOne({ _id: user._id });
    await Submission.deleteMany({ userId: user._id });
    
    res.json({ message: 'User terminated from system.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all levels
// @route   GET /api/admin/levels
// @access  Private/Admin
router.get('/levels', [protect, admin], async (req, res) => {
  try {
    const levels = await Level.find({}).sort({ levelNumber: 1 }).select('+answer');
    res.json(levels);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Add a new level
// @route   POST /api/admin/levels
// @access  Private/Admin
router.post('/levels', [protect, admin], async (req, res) => {
  try {
    const levelParams = req.body;
    const level = await Level.create(levelParams);
    res.status(201).json(level);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update a level
// @route   PUT /api/admin/levels/:id
// @access  Private/Admin
router.put('/levels/:id', [protect, admin], async (req, res) => {
  try {
    const updateData = { ...req.body };
    // If answer is empty or not provided, don't overwrite it
    if (updateData.answer === '' || updateData.answer === undefined) {
      delete updateData.answer;
    }
    
    const level = await Level.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!level) return res.status(404).json({ message: 'Level not found' });
    res.json(level);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete a level
// @route   DELETE /api/admin/levels/:id
// @access  Private/Admin
router.delete('/levels/:id', [protect, admin], async (req, res) => {
  try {
    const level = await Level.findById(req.params.id);
    if (!level) return res.status(404).json({ message: 'Level not found' });
    await Level.deleteOne({ _id: level._id });
    res.json({ message: 'Level removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', [protect, admin], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalSubmissions = await Submission.countDocuments();
    const correctSubmissions = await Submission.countDocuments({ status: 'correct' });
    const incorrectSubmissions = totalSubmissions - correctSubmissions;
    
    res.json({
      totalUsers,
      totalSubmissions,
      correctSubmissions,
      incorrectSubmissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
