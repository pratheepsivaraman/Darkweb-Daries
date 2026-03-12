const express = require('express');
const router = express.Router();
const Level = require('../models/Level');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { protect } = require('../middlewares/authMiddleware');
const { submissionLimiter } = require('../middlewares/rateLimiter');

// @desc    Get current level info for user
// @route   GET /api/levels/current
// @access  Private
router.get('/current', protect, async (req, res) => {
  try {
    const user = req.user;
    
    // Ensure puzzle solved
    if (!user.puzzleSolved) {
        return res.status(403).json({ message: 'Must solve initialization puzzle first' });
    }

    const level = await Level.findOne({ levelNumber: user.currentLevel }).select('-answer');

    if (!level) {
      if (user.currentLevel > 10) { // Assuming 10 levels
         return res.json({ message: 'All levels completed', completed: true });
      }
      return res.status(404).json({ message: 'Level not found' });
    }

    // Get the first submission for this level to determine when they started it
    // Wait, timer starts when question loads.
    // If no "start" submission exists, maybe we create a "started" record?
    // Or we use the timestamp from the LAST completed level, or user creation.
    // Better: We track level startTime in a separate way or just use the time of first GET request.
    // Let's create an "activeLevelStart" on the User model. Wait, I didn't add that.
    
    // Instead of adding a field, let's just let the client handle the timer for UI?
    // But points are calculated on backend based on time taken, so backend must know when they started.
    // Let's add `activeLevelStart` to User model dynamically now, or use last completedLevel time.
    let startTime;
    if (user.currentLevel === 1) {
       // Started after signup puzzle solved. For simplicity, just use user.updatedAt or current time if not set.
       // Ideally we add a startTime. Let's assume we update the user's `updatedAt` when they complete a level.
       startTime = user.updatedAt;
    } else {
       const lastCompleted = user.completedLevels.find(l => l.levelNumber === user.currentLevel - 1);
       startTime = lastCompleted ? lastCompleted.completedAt : user.updatedAt;
    }

    const timePassed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);

    // If threshold not reached, don't send clue
    let clueToSend = null;
    if (timePassed >= level.thresholdTime) {
       clueToSend = level.clue;
    }

    res.json({
      levelNumber: level.levelNumber,
      title: level.title,
      question: level.question,
      content: level.content,
      clue: clueToSend, // null if threshold not met
      startTime: startTime, // Send this to sync frontend timer
      thresholdTime: level.thresholdTime
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get clue manually if threshold passed
// @route   GET /api/levels/clue
// @access  Private
router.get('/clue', protect, async (req, res) => {
  try {
    const user = req.user;
    const level = await Level.findOne({ levelNumber: user.currentLevel }).select('thresholdTime clue');

    if (!level) return res.status(404).json({ message: 'Level not found' });

    let startTime;
    if (user.currentLevel === 1) {
       startTime = user.updatedAt;
    } else {
       const lastCompleted = user.completedLevels.find(l => l.levelNumber === user.currentLevel - 1);
       startTime = lastCompleted ? lastCompleted.completedAt : user.updatedAt;
    }

    const timePassed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);

    if (timePassed >= level.thresholdTime) {
       res.json({ clue: level.clue });
    } else {
       res.status(403).json({ message: 'Clue threshold not yet reached', timeLeft: level.thresholdTime - timePassed });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Submit answer for current level
// @route   POST /api/levels/submit
// @access  Private
router.post('/submit', [protect, submissionLimiter], async (req, res) => {
  try {
    const { answer } = req.body;
    const user = await User.findById(req.user._id);

    const level = await Level.findOne({ levelNumber: user.currentLevel }).select('+answer');

    if (!level) return res.status(404).json({ message: 'Level not found' });

    let startTime;
    if (user.currentLevel === 1) {
       startTime = user.updatedAt;
    } else {
       const lastCompleted = user.completedLevels.find(l => l.levelNumber === user.currentLevel - 1);
       startTime = lastCompleted ? lastCompleted.completedAt : user.updatedAt;
    }

    const timeTaken = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);

    let isCorrect = false;
    // Simple exact match or case-insensitive match
    if (answer && answer.toLowerCase().trim() === level.answer.toLowerCase().trim()) {
      isCorrect = true;
    }
    
    // Optional: Anti-cheat. If timeTaken < 2s, flag it?
    if (isCorrect && timeTaken < 2) {
      // Very suspicious 
      console.log(`Suspicious rapid solve by user ${user.username}`);
    }

    if (isCorrect) {
      // Dynamic point reduction logic
      let earnedPoints;
      const minutesTaken = Math.floor(timeTaken / 60);

      // Rule: If time taken exceeds thresholdTime, they could have seen the clue.
      // In this case, points are fixed to 20.
      if (timeTaken >= level.thresholdTime) {
        earnedPoints = 20;
      } else {
        // Otherwise: -20 points for every minute (60s) taken
        const reduction = minutesTaken * 20;
        // Ensure points don't drop below 21 (to keep it higher than the clue-penalty/threshold floor) 
        earnedPoints = Math.max(21, level.maxPoints - reduction);
      }

      // Record submission
      await Submission.create({
        userId: user._id,
        levelNumber: level.levelNumber,
        answer,
        timeTaken,
        pointsEarned: earnedPoints,
        status: 'correct'
      });

      // Update User
      user.completedLevels.push({
        levelNumber: level.levelNumber,
        pointsEarned: earnedPoints,
        timeTaken,
        completedAt: Date.now()
      });
      user.totalPoints += earnedPoints;
      user.currentLevel += 1;
      
      // We also update `updatedAt` to use as startTime for the next level
      await user.save();

      res.json({
        message: 'Correct answer!',
        earnedPoints,
        timeTaken,
        nextLevel: user.currentLevel,
        totalPoints: user.totalPoints
      });

    } else {
      // Incorrect answer
      await Submission.create({
        userId: user._id,
        levelNumber: level.levelNumber,
        answer,
        timeTaken,
        pointsEarned: 0,
        status: 'incorrect'
      });

      res.status(400).json({ message: 'Incorrect answer. Try again.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Skip current level
// @route   POST /api/levels/skip
// @access  Private
router.post('/skip', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const level = await Level.findOne({ levelNumber: user.currentLevel });

    if (!level) return res.status(404).json({ message: 'Level not found' });

    let startTime;
    if (user.currentLevel === 1) {
       startTime = user.updatedAt;
    } else {
       const lastCompleted = user.completedLevels.find(l => l.levelNumber === user.currentLevel - 1);
       startTime = lastCompleted ? lastCompleted.completedAt : user.updatedAt;
    }

    const timeTaken = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);

    // Record submission as skipped
    await Submission.create({
      userId: user._id,
      levelNumber: level.levelNumber,
      answer: '[SKIPPED]',
      timeTaken,
      pointsEarned: 0,
      status: 'skipped'
    });

    // Update User
    user.completedLevels.push({
      levelNumber: level.levelNumber,
      pointsEarned: 0,
      timeTaken,
      completedAt: Date.now()
    });
    
    // Total points don't increase
    user.currentLevel += 1;
    
    await user.save();

    res.json({
      message: 'Level skipped.',
      nextLevel: user.currentLevel,
      totalPoints: user.totalPoints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

