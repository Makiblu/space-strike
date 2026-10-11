// SPACE STRIKE - Chapter and Level System
// 10 Chapters × 5 Levels = 50 Total Levels

const CHAPTERS = [
    {
        id: 1,
        name: 'THE ASTEROID BELT',
        description: 'Begin your journey through the dangerous outer rim',
        difficulty: 1,
        unlocked: true
    },
    {
        id: 2,
        name: 'PIRATE TERRITORY',
        description: 'Face organized enemy squadrons',
        difficulty: 1.3,
        unlocked: false
    },
    {
        id: 3,
        name: 'NEBULA STORM',
        description: 'Navigate hazardous space weather',
        difficulty: 1.6,
        unlocked: false
    },
    {
        id: 4,
        name: 'MINING COLONY',
        description: 'Liberate captured facilities',
        difficulty: 2.0,
        unlocked: false
    },
    {
        id: 5,
        name: 'ENEMY FLEET',
        description: 'Confront the main invasion force',
        difficulty: 2.4,
        unlocked: false
    },
    {
        id: 6,
        name: 'DARK SECTOR',
        description: 'Venture into the unknown void',
        difficulty: 2.8,
        unlocked: false
    },
    {
        id: 7,
        name: 'WEAPONS FACILITY',
        description: 'Destroy the enemy production center',
        difficulty: 3.2,
        unlocked: false
    },
    {
        id: 8,
        name: 'CORE SYSTEMS',
        description: 'Strike at the heart of enemy territory',
        difficulty: 3.6,
        unlocked: false
    },
    {
        id: 9,
        name: 'COMMAND SHIP',
        description: 'Assault the flagship of the invasion',
        difficulty: 4.0,
        unlocked: false
    },
    {
        id: 10,
        name: 'FINAL STAND',
        description: 'The ultimate battle for survival',
        difficulty: 5.0,
        unlocked: false
    }
];

// Boss configurations
const BOSSES = {
    // Chapter 1 Boss
    ASTEROID_KING: {
        name: 'ASTEROID KING',
        health: 500,
        speed: 80,
        width: 150,  // Increased from 80 to 150
        height: 150, // Increased from 80 to 150
        color: '#aa6600',
        scoreValue: 1000,
        attacks: ['charge', 'debris']
    },
    
    // Chapter 2 Boss
    PIRATE_LORD: {
        name: 'PIRATE LORD',
        health: 750,
        speed: 100,
        width: 140,  // Increased from 70
        height: 140, // Increased from 70
        color: '#ff3300',
        scoreValue: 1500,
        attacks: ['spread', 'missiles']
    },
    
    // Chapter 3 Boss
    STORM_GUARDIAN: {
        name: 'STORM GUARDIAN',
        health: 1000,
        speed: 90,
        width: 160,  // Increased from 85
        height: 160, // Increased from 85
        color: '#00ffff',
        scoreValue: 2000,
        attacks: ['lightning', 'shield']
    },
    
    // Chapter 4 Boss
    MINING_MECH: {
        name: 'MINING MECH',
        health: 1200,
        speed: 70,
        width: 170,  // Increased from 90
        height: 170, // Increased from 90
        color: '#888888',
        scoreValue: 2500,
        attacks: ['laser', 'mines']
    },
    
    // Chapter 5 Boss
    FLEET_ADMIRAL: {
        name: 'FLEET ADMIRAL',
        health: 1500,
        speed: 110,
        width: 160,  // Increased from 85
        height: 160, // Increased from 85
        color: '#0066ff',
        scoreValue: 3000,
        attacks: ['barrage', 'reinforcements']
    },
    
    // Chapter 6 Boss
    VOID_ENTITY: {
        name: 'VOID ENTITY',
        health: 1800,
        speed: 120,
        width: 180,  // Increased from 100
        height: 180, // Increased from 100
        color: '#330066',
        scoreValue: 3500,
        attacks: ['teleport', 'pulse']
    },
    
    // Chapter 7 Boss
    PROTOTYPE_X: {
        name: 'PROTOTYPE-X',
        health: 2200,
        speed: 130,
        width: 175,  // Increased from 95
        height: 175, // Increased from 95
        color: '#ff0066',
        scoreValue: 4000,
        attacks: ['plasma', 'shield_burst']
    },
    
    // Chapter 8 Boss
    CORE_DEFENDER: {
        name: 'CORE DEFENDER',
        health: 2600,
        speed: 100,
        width: 200,  // Increased from 110
        height: 200, // Increased from 110
        color: '#ff6600',
        scoreValue: 5000,
        attacks: ['orbital', 'turrets']
    },
    
    // Chapter 9 Boss
    FLAGSHIP: {
        name: 'FLAGSHIP OMEGA',
        health: 3200,
        speed: 90,
        width: 220,  // Increased from 120
        height: 220, // Increased from 120
        color: '#cc0000',
        scoreValue: 6000,
        attacks: ['super_laser', 'fighters', 'missiles']
    },
    
    // Chapter 10 Boss
    FINAL_BOSS: {
        name: 'ANNIHILATOR',
        health: 5000,
        speed: 140,
        width: 250,  // Increased from 140 - MASSIVE!
        height: 250, // Increased from 140 - MASSIVE!
        color: '#ff0000',
        scoreValue: 10000,
        attacks: ['everything', 'ultimate']
    },
    
    // Quick Play Bosses (Progressive Difficulty)
    VOID_SERPENT: {
        name: 'VOID SERPENT',
        health: 800,
        speed: 100,
        width: 160,
        height: 160,
        color: '#9900ff',
        scoreValue: 1500,
        attacks: ['spiral', 'venom'],
        ability: 'spiral_shots' // Fires projectiles in spiral pattern
    },
    
    PLASMA_TITAN: {
        name: 'PLASMA TITAN',
        health: 1200,
        speed: 85,
        width: 180,
        height: 180,
        color: '#00ff99',
        scoreValue: 2500,
        attacks: ['energy_wave', 'pulse'],
        ability: 'energy_waves' // Fires waves of energy
    },
    
    SHADOW_REAPER: {
        name: 'SHADOW REAPER',
        health: 1800,
        speed: 130,
        width: 170,
        height: 170,
        color: '#220033',
        scoreValue: 4000,
        attacks: ['teleport', 'shadow_bolt'],
        ability: 'teleport_attack' // Teleports and fires
    },
    
    OMEGA_DESTROYER: {
        name: 'OMEGA DESTROYER',
        health: 3000,
        speed: 110,
        width: 220,
        height: 220,
        color: '#ff3300',
        scoreValue: 8000,
        attacks: ['mega_laser', 'missile_swarm', 'energy_field'],
        ability: 'multi_attack' // Uses multiple attacks at once (HARD MODE)
    },
    
    // Bot Arena Boss
    ARENA_CHAMPION: {
        name: 'ARENA CHAMPION',
        health: 1500,
        speed: 120,
        width: 180,
        height: 180,
        color: '#ffaa00',
        scoreValue: 5000,
        attacks: ['rapid_fire', 'tracking_missiles'],
        ability: 'champion_mode' // Fast and aggressive
    }
};

// Generate all 50 levels (10 chapters × 5 levels)
function generateLevels() {
    const levels = [];
    
    CHAPTERS.forEach((chapter, chapterIndex) => {
        for (let levelNum = 1; levelNum <= 5; levelNum++) {
            const isBossLevel = (levelNum === 5);
            const levelId = chapterIndex * 5 + levelNum;
            
            levels.push({
                id: levelId,
                chapter: chapter.id,
                levelNum: levelNum,
                name: isBossLevel ? `${chapter.name} - BOSS` : `${chapter.name} - Wave ${levelNum}`,
                isBoss: isBossLevel,
                
                // Enemy configuration
                enemyConfig: {
                    baseHealth: 30 * chapter.difficulty,
                    baseSpeed: 150 + (chapter.difficulty * 10),
                    spawnRate: Math.max(0.8, 1.5 - (chapter.difficulty * 0.1)),
                    enemyCount: isBossLevel ? 0 : (3 + levelNum), // No regular enemies in boss level
                    scoreMultiplier: chapter.difficulty
                },
                
                // Asteroid configuration
                asteroidConfig: {
                    spawnRate: Math.max(1.0, 2.0 - (chapter.difficulty * 0.1)),
                    speed: 100 + (chapter.difficulty * 15),
                    damage: 20 + (chapter.difficulty * 5)
                },
                
                // Boss configuration (if boss level)
                boss: isBossLevel ? Object.keys(BOSSES)[chapterIndex] : null,
                
                // Rewards
                rewards: {
                    coins: isBossLevel ? (100 * chapter.difficulty) : (30 * chapter.difficulty),
                    xp: isBossLevel ? (200 * chapter.difficulty) : (50 * chapter.difficulty)
                },
                
                // Unlock requirements
                unlockRequires: {
                    chapter: chapter.id,
                    previousLevel: levelId > 1 ? levelId - 1 : null
                }
            });
        }
    });
    
    return levels;
}

const LEVELS = generateLevels();

// Helper functions
function getLevelById(id) {
    return LEVELS.find(l => l.id === id);
}

function getLevelsByChapter(chapterId) {
    return LEVELS.filter(l => l.chapter === chapterId);
}

function getChapterById(id) {
    return CHAPTERS.find(c => c.id === id);
}

function isLevelUnlocked(levelId, progress) {
    const level = getLevelById(levelId);
    if (!level) return false;
    
    // First level is always unlocked
    if (levelId === 1) return true;
    
    // Check if previous level is completed
    if (level.unlockRequires.previousLevel) {
        const prevCompleted = progress.completedLevels.some(
            cl => cl.levelId === level.unlockRequires.previousLevel
        );
        return prevCompleted;
    }
    
    return false;
}

function completeLevel(levelId, results, profile, progress) {
    const level = getLevelById(levelId);
    if (!level) return { success: false };
    
    // Add to completed levels if not already there
    if (!progress.completedLevels.find(cl => cl.levelId === levelId)) {
        progress.completedLevels.push({
            levelId: levelId,
            completedAt: Date.now(),
            score: results.score,
            targetsDestroyed: results.targetsDestroyed
        });
    }
    
    // Update best score
    if (!progress.bestScores[levelId] || results.score > progress.bestScores[levelId]) {
        progress.bestScores[levelId] = results.score;
    }
    
    // Unlock next level
    const nextLevel = getLevelById(levelId + 1);
    if (nextLevel) {
        const alreadyUnlocked = progress.unlockedLevels.some(
            ul => ul.chapter === nextLevel.chapter && ul.level === nextLevel.levelNum
        );
        
        if (!alreadyUnlocked) {
            progress.unlockedLevels.push({
                chapter: nextLevel.chapter,
                level: nextLevel.levelNum
            });
        }
        
        // Unlock next chapter if entering new chapter
        if (nextLevel.chapter > progress.currentChapter) {
            if (!progress.unlockedChapters.includes(nextLevel.chapter)) {
                progress.unlockedChapters.push(nextLevel.chapter);
            }
            progress.currentChapter = nextLevel.chapter;
        }
    }
    
    // Award rewards
    profile.coins += level.rewards.coins;
    profile.xp += level.rewards.xp;
    
    // Check for level up
    while (profile.xp >= profile.xpToNextLevel) {
        profile.xp -= profile.xpToNextLevel;
        profile.level++;
        profile.xpToNextLevel = Math.floor(100 * Math.pow(1.15, profile.level - 1));
    }
    
    return {
        success: true,
        rewards: level.rewards,
        leveledUp: false,
        newLevel: profile.level
    };
}
