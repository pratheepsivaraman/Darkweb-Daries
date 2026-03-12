const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  levelNumber: {
    type: Number,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  timeTaken: {
    type: Number, // in seconds since level start
    required: true,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['correct', 'incorrect', 'skipped'],
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
