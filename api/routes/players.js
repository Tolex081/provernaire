const Player = require('../models/Player');
const express = require('express');
const router = express.Router();
const normalizeTeamName = (name) => name?.replace(/^Team\s+/i, '').trim();


// Team color mapping
const teamColors = {
  Pink: '#FF54D7',
  Blue: '#61C3FF',
  Purple: '#B753FF',
  Orange: '#FF955E',
  Green: '#B0FF6F'
};

// 💾 POST player entry
router.post('/', async (req, res) => {
  try {
    let {
      username,
      pfp,
      team,
      score,
      questionNumber,
      completed,
      failed,
      walkedAway,
      timeUp,
      timestamp
    } = req.body;

    console.log('📝 Handling player entry:', { username, team, score });

    // Sanitize username
    username = username?.trim().replace(/^@/, '');

    // Ensure team object structure
    if (typeof team === 'string') {
  const rawTeam = normalizeTeamName(team);
  team = {
    name: rawTeam,
    color: teamColors[rawTeam] || '#CCCCCC'
  };
}

    // Basic validation
    if (!username || !team || score === undefined) {
      return res.status(400).json({ message: 'Username, team, and score are required' });
    }

    const existingPlayer = await Player.findOne({
  username,
  'team.name': normalizeTeamName(team.name || team)
});


    if (existingPlayer) {
      console.log('🔁 Player exists, checking for changes...');

      // Determine if we should update (even if score is same)
      const shouldUpdate =
        score > existingPlayer.score ||
        completed !== existingPlayer.completed ||
        failed !== existingPlayer.failed ||
        walkedAway !== existingPlayer.walkedAway ||
        timeUp !== existingPlayer.timeUp;

      if (shouldUpdate) {
        existingPlayer.score = Math.max(score, existingPlayer.score); // Always keep highest score
        existingPlayer.questionNumber = questionNumber || existingPlayer.questionNumber;
        existingPlayer.completed = !!completed;
        existingPlayer.failed = !!failed;
        existingPlayer.walkedAway = !!walkedAway;
        existingPlayer.timeUp = !!timeUp;
        existingPlayer.pfp = pfp || existingPlayer.pfp;
        existingPlayer.timestamp = timestamp || Date.now();

        const updated = await existingPlayer.save();
        console.log('✅ Player updated:', updated._id);
        return res.status(200).json(updated);
      } else {
        console.log('➖ No relevant changes — skipping update.');
        return res.status(200).json(existingPlayer);
      }
    }

    // New player
    const newPlayer = new Player({
      username,
      pfp,
      team,
      score,
      questionNumber,
      completed: !!completed,
      failed: !!failed,
      walkedAway: !!walkedAway,
      timeUp: !!timeUp,
      timestamp: timestamp || Date.now()
    });

    const savedPlayer = await newPlayer.save();
    console.log('✅ New player created:', savedPlayer._id);
    res.status(201).json(savedPlayer);

  } catch (error) {
    console.error('❌ Error saving player:', error);
    res.status(500).json({ message: 'Server error while saving player', error: error.message });
  }
});

// 🏁 GET all players (Leaderboard)
router.get('/', async (req, res) => {
  try {
    const players = await Player.find({
      $or: [
        { score: { $gt: 0 } },
        { completed: true },
        { failed: true },
        { walkedAway: true },
        { timeUp: true }
      ]
    }).sort({ score: -1, timestamp: 1 });

    res.status(200).json(players);
  } catch (err) {
    console.error('❌ Error fetching players:', err);
    res.status(500).json({ message: 'Server error fetching players', error: err.message });
  }
});

module.exports = router;
