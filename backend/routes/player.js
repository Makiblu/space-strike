const express = require('express');
const db = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Get player profile
router.get('/profile', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT pp.*, u.username, u.email, u.created_at 
       FROM player_profiles pp
       JOIN users u ON pp.user_id = u.user_id
       WHERE pp.user_id = $1`,
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Player profile not found'
      });
    }

    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve profile'
    });
  }
});

// Update player profile
router.put('/profile', async (req, res) => {
  const { displayName, selectedFighter } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (displayName !== undefined) {
      updates.push(`display_name = $${paramCount++}`);
      values.push(displayName);
    }
    if (selectedFighter !== undefined) {
      updates.push(`selected_fighter = $${paramCount++}`);
      values.push(selectedFighter);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.session.userId);

    const result = await db.query(
      `UPDATE player_profiles 
       SET ${updates.join(', ')} 
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({ 
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update profile'
    });
  }
});

// Get player progress
router.get('/progress', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM player_progress WHERE user_id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Player progress not found'
      });
    }

    res.json({ progress: result.rows[0] });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve progress'
    });
  }
});

// Update player progress
router.put('/progress', async (req, res) => {
  const { currentChapter, unlockedChapters, completedLevels, bestScores } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (currentChapter !== undefined) {
      updates.push(`current_chapter = $${paramCount++}`);
      values.push(currentChapter);
    }
    if (unlockedChapters !== undefined) {
      updates.push(`unlocked_chapters = $${paramCount++}`);
      values.push(JSON.stringify(unlockedChapters));
    }
    if (completedLevels !== undefined) {
      updates.push(`completed_levels = $${paramCount++}`);
      values.push(JSON.stringify(completedLevels));
    }
    if (bestScores !== undefined) {
      updates.push(`best_scores = $${paramCount++}`);
      values.push(JSON.stringify(bestScores));
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.session.userId);

    const result = await db.query(
      `UPDATE player_progress 
       SET ${updates.join(', ')} 
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({ 
      success: true,
      progress: result.rows[0]
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update progress'
    });
  }
});

// Get unlocked fighters
router.get('/fighters', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT fighter_id, unlocked_at FROM player_fighters WHERE user_id = $1 ORDER BY unlocked_at',
      [req.session.userId]
    );

    res.json({ fighters: result.rows });
  } catch (error) {
    console.error('Get fighters error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve fighters'
    });
  }
});

// Unlock fighter
router.post('/fighters', async (req, res) => {
  const { fighterId } = req.body;

  if (!fighterId) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Fighter ID is required'
    });
  }

  try {
    // Check if already unlocked
    const existing = await db.query(
      'SELECT * FROM player_fighters WHERE user_id = $1 AND fighter_id = $2',
      [req.session.userId, fighterId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Already unlocked',
        message: 'Fighter already unlocked'
      });
    }

    const result = await db.query(
      'INSERT INTO player_fighters (user_id, fighter_id) VALUES ($1, $2) RETURNING *',
      [req.session.userId, fighterId]
    );

    res.status(201).json({ 
      success: true,
      fighter: result.rows[0]
    });
  } catch (error) {
    console.error('Unlock fighter error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to unlock fighter'
    });
  }
});

// Get inventory
router.get('/inventory', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM player_inventory WHERE user_id = $1',
      [req.session.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Player inventory not found'
      });
    }

    res.json({ inventory: result.rows[0] });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to retrieve inventory'
    });
  }
});

// Update inventory
router.put('/inventory', async (req, res) => {
  const { healthPotions, shieldBoosts, damageBoosts } = req.body;

  try {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (healthPotions !== undefined) {
      updates.push(`health_potions = $${paramCount++}`);
      values.push(healthPotions);
    }
    if (shieldBoosts !== undefined) {
      updates.push(`shield_boosts = $${paramCount++}`);
      values.push(shieldBoosts);
    }
    if (damageBoosts !== undefined) {
      updates.push(`damage_boosts = $${paramCount++}`);
      values.push(damageBoosts);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: 'No fields to update'
      });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.session.userId);

    const result = await db.query(
      `UPDATE player_inventory 
       SET ${updates.join(', ')} 
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    res.json({ 
      success: true,
      inventory: result.rows[0]
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update inventory'
    });
  }
});

// Update coins
router.put('/coins', async (req, res) => {
  const { coins } = req.body;

  if (coins === undefined || typeof coins !== 'number') {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Coins must be a number'
    });
  }

  try {
    const result = await db.query(
      `UPDATE player_profiles 
       SET coins = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $2
       RETURNING coins`,
      [coins, req.session.userId]
    );

    res.json({ 
      success: true,
      coins: result.rows[0].coins
    });
  } catch (error) {
    console.error('Update coins error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'Failed to update coins'
    });
  }
});

module.exports = router;
