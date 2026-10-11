-- SPACE STRIKE Database Schema
-- PostgreSQL 12+

-- Drop existing tables (for fresh install)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS player_inventory CASCADE;
DROP TABLE IF EXISTS player_fighters CASCADE;
DROP TABLE IF EXISTS player_progress CASCADE;
DROP TABLE IF EXISTS player_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (authentication)
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  account_status VARCHAR(20) DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Player profiles (game data)
CREATE TABLE player_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  selected_fighter VARCHAR(50) DEFAULT 'VIPER',
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 500,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player progress (chapters and levels)
CREATE TABLE player_progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  current_chapter INTEGER DEFAULT 1,
  unlocked_chapters JSONB DEFAULT '[1]'::jsonb,
  completed_levels JSONB DEFAULT '{}'::jsonb,
  best_scores JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player fighters (unlocked fighters)
CREATE TABLE player_fighters (
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  fighter_id VARCHAR(50) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, fighter_id)
);

CREATE INDEX idx_player_fighters_user ON player_fighters(user_id);

-- Player inventory (items)
CREATE TABLE player_inventory (
  user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  health_potions INTEGER DEFAULT 0,
  shield_boosts INTEGER DEFAULT 0,
  damage_boosts INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Game results (leaderboard and history)
CREATE TABLE game_results (
  result_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('quick_play', 'adventure', 'bot_arena')),
  fighter_used VARCHAR(50) NOT NULL,
  targets_destroyed INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0,
  chapter INTEGER,
  level INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_results_user ON game_results(user_id);
CREATE INDEX idx_game_results_mode ON game_results(game_mode);
CREATE INDEX idx_game_results_score ON game_results(score DESC);
CREATE INDEX idx_game_results_created ON game_results(created_at DESC);

-- Sessions table (active user sessions)
CREATE TABLE sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Insert default starter fighter for new users
CREATE OR REPLACE FUNCTION create_default_player_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO player_profiles (user_id, display_name)
  VALUES (NEW.user_id, NEW.username);
  
  -- Create progress
  INSERT INTO player_progress (user_id)
  VALUES (NEW.user_id);
  
  -- Unlock starter fighter (VIPER)
  INSERT INTO player_fighters (user_id, fighter_id)
  VALUES (NEW.user_id, 'VIPER');
  
  -- Create inventory
  INSERT INTO player_inventory (user_id)
  VALUES (NEW.user_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_player_data_on_register
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_player_data();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- View for global leaderboard (best score per user per game mode)
CREATE OR REPLACE VIEW global_leaderboard AS
WITH best_scores AS (
  SELECT 
    user_id,
    game_mode,
    MAX(score) as best_score,
    MAX(targets_destroyed) as best_targets,
    MIN(play_time) as best_time
  FROM game_results
  GROUP BY user_id, game_mode
),
ranked_results AS (
  SELECT 
    gr.user_id,
    gr.game_mode,
    gr.fighter_used,
    gr.score,
    gr.targets_destroyed,
    gr.play_time,
    gr.chapter,
    gr.level,
    gr.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY gr.user_id, gr.game_mode 
      ORDER BY gr.score DESC, gr.targets_destroyed DESC, gr.created_at DESC
    ) as user_rank
  FROM game_results gr
)
SELECT 
  u.username,
  pp.display_name,
  rr.game_mode,
  rr.fighter_used,
  rr.score,
  rr.targets_destroyed,
  rr.play_time,
  rr.chapter,
  rr.level,
  rr.created_at,
  ROW_NUMBER() OVER (PARTITION BY rr.game_mode ORDER BY rr.score DESC, rr.targets_destroyed DESC) as rank
FROM ranked_results rr
JOIN users u ON rr.user_id = u.user_id
JOIN player_profiles pp ON rr.user_id = pp.user_id
WHERE u.account_status = 'active'
  AND rr.user_rank = 1;

-- Comments
COMMENT ON TABLE users IS 'User authentication and account information';
COMMENT ON TABLE player_profiles IS 'Player game profile and currency';
COMMENT ON TABLE player_progress IS 'Chapter and level progression tracking';
COMMENT ON TABLE player_fighters IS 'Unlocked fighters per player';
COMMENT ON TABLE player_inventory IS 'Player consumable items';
COMMENT ON TABLE game_results IS 'Game history and leaderboard data';
COMMENT ON TABLE sessions IS 'Active user sessions for authentication';
