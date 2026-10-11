const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Submit game result
router.post('/result', async (req, res) => {
  const {
    gameMode,
    fighterUsed,
    targetsDestroyed,
    score,
    playTime,
    chapter,
    level,
    completed
  } = req.body;

  // Validation
  if (!gameMode || !fighterUsed || score === undefined) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Game mode, fighter, and score are required'
    });
  }

  const validModes = ['quick_play', 'adventure', 'bot_arena'];
  if (!validModes.includes(gameMode)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid game mode'
    });
  }

  try {
    // Insert game result
    const result = await db.query(
      `INSERT INTO game_results 
       (user_id, game_mode, fighter_used, targets_destroyed, score, play_time, chapter, level, completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.session.userId,
        gameMode,
        fighterUsed,
        targetsDestroyed || 0,
        score,
        playTime || 0,
        chapter,
        level,
        completed || false
      ]
    );

    // Calculate coins earned: 1 coin per target destroyed
    const coinsEarned = targetsDestroyed || 0;

    // Update player's coins in database (player_profiles table)
    if (coinsEarned > 0) {
      await db.query(
        `UPDATE player_profiles 
         SET coins = coins + $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [coinsEarned, req.session.userId]
      );
    }

    // Also update XP (5 XP per target)
    const xpEarned = Math.floor((targetsDestroyed || 0) * 5);
    if (xpEarned > 0) {
      await db.query(
        `UPDATE player_profiles 
         SET xp = xp + $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [xpEarned, req.session.userId]
      );
    }

    res.status(201).json({ 
      success: true,
      result: result.rows[0],
      coinsEarned: coinsEarned,
      xpEarned: xpEarned
    });
  } catch (error) {
    console.error('Submit result error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to submit game result'
    });
  }
});

// Get player's game history
router.get('/history', async (req, res) => {
  const { gameMode, limit = 20, offset = 0 } = req.query;

  try {
    let query = `
      SELECT * FROM game_results 
      WHERE user_id = $1
    `;
    const params = [req.session.userId];

    if (gameMode) {
      query += ` AND game_mode = $2`;
      params.push(gameMode);
      query += ` ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
      params.push(parseInt(limit), parseInt(offset));
    } else {
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(parseInt(limit), parseInt(offset));
    }

    const result = await db.query(query, params);

    res.json({ 
      history: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve game history'
    });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  const { gameMode = 'quick_play', limit = 100 } = req.query;

  const validModes = ['quick_play', 'adventure', 'bot_arena'];
  if (!validModes.includes(gameMode)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid game mode'
    });
  }

  try {
    const result = await db.query(
      `SELECT 
        username,
        display_name,
        game_mode,
        fighter_used,
        score,
        targets_destroyed,
        play_time,
        chapter,
        level,
        created_at,
        rank
       FROM global_leaderboard
       WHERE game_mode = $1
       ORDER BY rank
       LIMIT $2`,
      [gameMode, parseInt(limit)]
    );

    res.json({ 
      leaderboard: result.rows,
      gameMode: gameMode
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve leaderboard'
    });
  }
});

// Get player rank
router.get('/rank', async (req, res) => {
  const { gameMode = 'quick_play' } = req.query;

  const validModes = ['quick_play', 'adventure', 'bot_arena'];
  if (!validModes.includes(gameMode)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid game mode'
    });
  }

  try {
    // Get player's best score for this mode
    const bestScore = await db.query(
      `SELECT MAX(score) as best_score
       FROM game_results
       WHERE user_id = $1 AND game_mode = $2`,
      [req.session.userId, gameMode]
    );

    if (!bestScore.rows[0].best_score) {
      return res.json({ 
        rank: null,
        bestScore: 0,
        message: 'No games played in this mode'
      });
    }

    // Get player's rank
    const rankResult = await db.query(
      `SELECT rank
       FROM global_leaderboard
       WHERE username = (SELECT username FROM users WHERE user_id = $1)
       AND game_mode = $2
       AND score = $3
       LIMIT 1`,
      [req.session.userId, gameMode, bestScore.rows[0].best_score]
    );

    res.json({ 
      rank: rankResult.rows[0]?.rank || null,
      bestScore: bestScore.rows[0].best_score
    });
  } catch (error) {
    console.error('Get rank error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve player rank'
    });
  }
});

module.exports = router;
