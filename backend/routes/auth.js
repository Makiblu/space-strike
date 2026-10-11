const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const router = express.Router();

const SALT_ROUNDS = 10;

// Register new user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validation
  if (!username || !email || !password) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Username, email, and password are required'
    });
  }

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Username must be between 3 and 50 characters'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Password must be at least 6 characters'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Invalid email format'
    });
  }

  try {
    // Check if username or email already exists
    const existingUser = await db.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Registration failed',
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert new user
    const result = await db.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING user_id, username, email, created_at`,
      [username, email, passwordHash]
    );

    const newUser = result.rows[0];

    // Create session
    req.session.userId = newUser.user_id;
    req.session.username = newUser.username;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        userId: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Validation failed',
      message: 'Username and password are required'
    });
  }

  try {
    // Get user by username or email
    const result = await db.query(
      'SELECT user_id, username, email, password_hash, account_status FROM users WHERE username = $1 OR email = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    const user = result.rows[0];

    // Check account status
    if (user.account_status !== 'active') {
      return res.status(403).json({ 
        error: 'Account suspended',
        message: 'Your account has been suspended'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: 'Invalid username or password'
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Create session
    req.session.userId = user.user_id;
    req.session.username = user.username;

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        userId: user.user_id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: 'An error occurred during login'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Server error',
        message: 'An error occurred during logout'
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Check session status and get player coins
router.get('/status', async (req, res) => {
  if (req.session && req.session.userId) {
    try {
      // Get player coins from database
      const result = await db.query(
        'SELECT coins FROM player_profiles WHERE user_id = $1',
        [req.session.userId]
      );
      
      const coins = result.rows[0]?.coins || 0;
      
      res.json({
        authenticated: true,
        userId: req.session.userId,
        username: req.session.username,
        user: {
          coins: coins
        }
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.json({
        authenticated: true,
        userId: req.session.userId,
        username: req.session.username
      });
    }
  } else {
    res.json({
      authenticated: false
    });
  }
});

module.exports = router;
