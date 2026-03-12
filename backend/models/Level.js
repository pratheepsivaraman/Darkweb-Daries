const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  levelNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  clue: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
    select: false, // Don't return answer by default unless explicitly asked
  },
  thresholdTime: {
    type: Number, // Time in seconds after which clue drops
    required: true,
  },
  maxPoints: {
    type: Number,
    required: true,
    default: 100,
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // Can store additional structure for specific levels
  }
}, { timestamps: true });

module.exports = mongoose.model('Level', levelSchema);
