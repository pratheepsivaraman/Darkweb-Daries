const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public (or protected if we want)
router.get('/', async (req, res) => {
  try {
    // Rank logic: 
    // 1. Highest totalPoints
    // 2. Highest completedLevels (currentLevel)
    // 3. User with lowest time taken overall? 
    // Actually totalPoints already reflects time taken.
    // Let's just sort by totalPoints DESC, then currentLevel DESC.
    
    const topUsers = await User.find({ role: 'user' })
      .select('username totalPoints currentLevel completedLevels updatedAt')
      .sort({ totalPoints: -1, currentLevel: -1, updatedAt: 1 }) // Tie breaker: whoever reached it first
      .limit(100);

    // Format for frontend
    const leaderboard = topUsers.map((user, index) => {
      // Calculate total time taken across all completed levels
      const totalTime = user.completedLevels.reduce((acc, curr) => acc + curr.timeTaken, 0);

      return {
        rank: index + 1,
        username: user.username,
        totalPoints: user.totalPoints,
        levelsCompleted: user.currentLevel > 1 ? user.currentLevel - 1 : 0,
        totalTimeTaken: totalTime,
      };
    });

    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
