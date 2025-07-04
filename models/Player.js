const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  pfp: { type: String },
  team: {
    name: { type: String, required: true },
    color: { type: String, required: true }
  },
  score: { type: Number, required: true },
  questionNumber: { type: Number },
  completed: { type: Boolean, default: false },
  failed: { type: Boolean, default: false },
  walkedAway: { type: Boolean, default: false },
  timeUp: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', playerSchema);


