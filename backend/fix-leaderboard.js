const db = require('./config/database');
const fs = require('fs');

(async () => {
  try {
    console.log('Updating leaderboard view...');
    
    const viewSQL = `
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
    `;
    
    await db.query(viewSQL);
    console.log('✓ Leaderboard view updated successfully');
    console.log('✓ Now shows only BEST score per user (no duplicates)');
    
    const result = await db.query(`
      SELECT * FROM global_leaderboard 
      WHERE game_mode = 'quick_play' 
      ORDER BY rank 
      LIMIT 10
    `);
    
    console.log('\nCurrent Quick Play Leaderboard:');
    console.log('================================');
    if (result.rows.length === 0) {
      console.log('No entries yet.');
    } else {
      result.rows.forEach(row => {
        console.log(`#${row.rank} - ${row.username} (${row.display_name})`);
        console.log(`   Score: ${row.score} pts | Targets: ${row.targets_destroyed} | Fighter: ${row.fighter_used}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
