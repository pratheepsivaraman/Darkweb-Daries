const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  currentLevel: {
    type: Number,
    default: 1,
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  completedLevels: [{
    levelNumber: Number,
    pointsEarned: Number,
    timeTaken: Number, // in seconds
    completedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  puzzleSolved: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Prevent sending password in response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
