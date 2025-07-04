const Player = require('../../api/models/Player');
const express = require('express');
const router = express.Router();

// 🔍 GET user's team selection
router.get('/:username', async (req, res) => {
  try {
    let { username } = req.params;
    username = username?.trim().replace(/^@/, '');

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    console.log('🔍 Looking up team for user:', username);

    const player = await Player.findOne({ username }).sort({ timestamp: -1 });

    if (player && player.team) {
      console.log('✅ Found team for user:', username, '-> Team:', player.team);
      return res.status(200).json({
        username: player.username,
        team: player.team,
        pfp: player.pfp || null
      });
    } else {
      console.log('➖ No team found for user:', username);
      return res.status(404).json({ message: 'No team selection found for this user' });
    }

  } catch (error) {
    console.error('❌ Error retrieving team:', error);
    res.status(500).json({ message: 'Server error while retrieving team', error: error.message });
  }
});

// 🔄 Always allow team change — this route now just says "yes"
router.get('/can-change/:username', async (req, res) => {
  try {
    let { username } = req.params;
    username = username?.trim().replace(/^@/, '');

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // ✅ Always allow team change
    console.log(`🔓 Team change always allowed for user: ${username}`);
    res.json({
      username,
      canChangeTeam: true,
      reason: 'Team change is always allowed'
    });

  } catch (error) {
    console.error('❌ Error checking team change permission:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 💾 POST/PUT team selection — always allow update
router.post('/', async (req, res) => {
  try {
    let { username, team, pfp } = req.body;
    username = username?.trim().replace(/^@/, '');

    if (!username || !team) {
      return res.status(400).json({ message: 'Username and team are required' });
    }

    console.log('💾 Saving team selection:', { username, team, pfp });

    const existingPlayer = await Player.findOne({ username }).sort({ timestamp: -1 });

    if (existingPlayer) {
      existingPlayer.team = team;
      if (pfp && pfp !== existingPlayer.pfp) {
        existingPlayer.pfp = pfp;
      }
      existingPlayer.timestamp = Date.now();

      const updated = await existingPlayer.save();
      console.log('✅ Team selection updated for existing player:', updated._id);

      return res.status(200).json({
        success: true,
        message: 'Team selection updated successfully',
        username: updated.username,
        team: updated.team,
        pfp: updated.pfp,
        locked: false // 🔓 Always false
      });
    } else {
      const newPlayer = new Player({
        username,
        pfp: pfp || null,
        team,
        score: 0,
        questionNumber: 0,
        completed: false,
        failed: false,
        walkedAway: false,
        timeUp: false,
        timestamp: Date.now()
      });

      const savedPlayer = await newPlayer.save();
      console.log('✅ New player created with team selection:', savedPlayer._id);

      return res.status(201).json({
        success: true,
        message: 'Team selection saved successfully',
        username: savedPlayer.username,
        team: savedPlayer.team,
        pfp: savedPlayer.pfp,
        locked: false // 🔓 Always false
      });
    }

  } catch (error) {
    console.error('❌ Error saving team selection:', error);
    res.status(500).json({ message: 'Server error while saving team selection', error: error.message });
  }
});

// 🗑️ DELETE team selection
router.delete('/:username', async (req, res) => {
  try {
    let { username } = req.params;
    username = username?.trim().replace(/^@/, '');

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    console.log('🗑️ Clearing team selection for user:', username);

    const player = await Player.findOne({ username }).sort({ timestamp: -1 });

    if (player) {
      player.team = null;
      player.timestamp = Date.now();

      const updated = await player.save();
      console.log('✅ Team selection cleared for user:', username);
      return res.status(200).json({ message: 'Team selection cleared successfully' });
    } else {
      console.log('➖ No player found for user:', username);
      return res.status(404).json({ message: 'No player found for this username' });
    }

  } catch (error) {
    console.error('❌ Error clearing team selection:', error);
    res.status(500).json({ message: 'Server error while clearing team selection', error: error.message });
  }
});

module.exports = router;
