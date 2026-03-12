const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        puzzleSolved: user.puzzleSolved,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // We allow login via email or username
    const user = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: email }] 
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Check if they need to solve the puzzle first?
      if (!user.puzzleSolved && user.role !== 'admin') {
         return res.status(403).json({ 
           message: 'Must solve initialization puzzle first.',
           puzzleRequired: true 
         });
      }

      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        currentLevel: user.currentLevel,
        totalPoints: user.totalPoints,
        puzzleSolved: user.puzzleSolved,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email/username or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Verify initial puzzle
// @route   POST /api/auth/verify-puzzle
// @access  Private
router.post('/verify-puzzle', [authLimiter, protect], async (req, res) => {
  try {
    const { answer } = req.body;
    
    // Example puzzle: "What port number does HTTP use?" or something hidden in the HTML?
    // Based on user requirements: "special puzzle page appears. Only if solved, login visible" 
    // Wait, if they just signed up, they can be authenticated but puzzleSolved is false.
    // Or we handle the puzzle without authentication? 
    // They are authenticated immediately after signup, so we can use `protect`.
    
    // Let's say the puzzle answer is expected to be "0xDEADBEEF" or whatever we set.
    // We will hardcode a simple puzzle for now.
    const EXPECTED_ANSWER = "root"; // They can figure this out from frontend clue.

    if (answer && answer.toLowerCase() === EXPECTED_ANSWER.toLowerCase()) {
      const user = await User.findById(req.user._id);
      user.puzzleSolved = true;
      await user.save();
      res.json({ message: 'Initialization complete. System access granted.', puzzleSolved: true });
    } else {
      res.status(400).json({ message: 'Access denied. Incorrect sequence.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      currentLevel: user.currentLevel,
      totalPoints: user.totalPoints,
      puzzleSolved: user.puzzleSolved,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

module.exports = router;
