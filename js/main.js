// SPACE STRIKE - Complete Game Engine v1.0
// Evaluation-ready with all required features

// ========================================
// GAME STATE MANAGEMENT
// ========================================

const GameState = {
    LOADING: 'loading',
    LOGIN: 'login',
    MENU: 'menu',
    HANGAR: 'hangar',
    GACHA: 'gacha',
    ADVENTURE: 'adventure',
    LEVEL_SELECT: 'levelselect',
    ARENA: 'arena',
    INVENTORY: 'inventory',
    UPGRADE: 'upgrade',
    LEADERBOARD: 'leaderboard',
    SETTINGS: 'settings',
    PLAYING: 'playing',
    PAUSED: 'paused',
    RESULTS: 'results',
    GAME_OVER: 'gameover'
};

let currentState = GameState.LOADING;
let currentProfile = null;
let currentProgress = null;
let currentFighters = null;
let currentInventory = null;
let currentSettings = null;

// ========================================
// GAME MODE
// ========================================

const GameMode = {
    QUICK_PLAY: 'quickplay',
    ADVENTURE: 'adventure',
    ARENA: 'arena'
};

let currentGameMode = null;
let currentLevel = null;
let gameDifficultyMultiplier = 1.0; // Increases after each boss kill
let bossesDefeated = 0; // Track how many bosses defeated
let arenaBot = null;

// Menu background animation variables
let menuBgCanvas = null;
let menuBgCtx = null;
let menuBgAnimationFrame = null;
let menuAsteroids = [];
let menuShootingStars = [];

// ========================================
// CANVAS SETUP
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HUD boundary - calculated dynamically
let hudHeight = 0;
let gameplayTopBoundary = 0;

function calculateHUDBoundary() {
    const hudElement = document.querySelector('.hud-header');
    if (hudElement) {
        // Get the actual rendered height of the HUD header
        const rect = hudElement.getBoundingClientRect();
        hudHeight = rect.height;
        gameplayTopBoundary = hudHeight + 10; // Add 10px buffer
        console.log('HUD Boundary Calculated:', { hudHeight, gameplayTopBoundary, rectTop: rect.top, rectBottom: rect.bottom });
        
        // Debug indicator removed - invisible now
    } else {
        // Fallback if HUD not found
        hudHeight = 100;
        gameplayTopBoundary = 110;
        console.warn('HUD element not found, using fallback boundary:', gameplayTopBoundary);
    }
}

// Debug functions removed - barrier is invisible

function showBoundaryDebugInfo() {
    // Disabled - no visual indicator
}

function showBarrierHit(objectType, x, y) {
    // Disabled - no visual indicator
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    calculateHUDBoundary(); // Recalculate HUD boundary on resize
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// GAME CONFIGURATION
// ========================================

const CONFIG = {
    player: {
        width: 40,
        height: 30,
        baseSpeed: 300,
        baseMaxHealth: 100,
        baseShootCooldown: 0.2,
        baseProjectileDamage: 10
    },
    projectile: {
        width: 8,
        height: 4,
        speed: 500
    },
    missile: {
        width: 12,
        height: 6,
        speed: 400,
        homingStrength: 2
    },
    enemy: {
        width: 35,
        height: 35,
        baseSpeed: 150,
        baseSpawnRate: 1.5,
        baseScoreValue: 100,
        baseHealth: 30
    },
    ufo: {
        width: 50,
        height: 30,
        baseSpeed: 120,
        baseSpawnRate: 8.0, // Spawn every 8 seconds
        baseScoreValue: 250,
        baseHealth: 50,
        shootCooldown: 2.0 // UFO shoots every 2 seconds
    },
    asteroid: {
        width: 50,
        height: 50,
        baseSpeed: 180, // Increased from 100 to 180 (80% faster!)
        baseSpawnRate: 1.6, // Spawn slightly more frequently (was 2.0)
        baseDamage: 20
    }
};

// Player upgrades
const upgrades = {
    health: 0,
    speed: 0,
    damage: 0
};

// ========================================
// GAME VARIABLES
// ========================================

let player = null;
let projectiles = [];
let missiles = [];
let enemies = [];
let ufos = []; // UFO enemies that shoot at player
let asteroids = [];
let particles = [];
let laserBeams = []; // Visible laser beam attacks
let powerups = []; // Supply drops (health, shield, missiles)
let boss = null;
let bossSpawned = false; // Track if boss spawned in Quick Play
let score = 0;
let targetsDestroyed = 0;
let coinsEarned = 0;
let xpEarned = 0;
let playerHealth = 100; // Player health tracking
let lastTime = 0;
let enemySpawnTimer = 0;
let ufoSpawnTimer = 0; // UFO spawn timer
let asteroidSpawnTimer = 0;

// Timer tracking
let playTime = 0; // Total play time in seconds (real time, continues during pause)
let gameStartTime = 0; // Timestamp when game started

// Player state
let missileCount = 0;
let abilityReady = true;
let abilityCooldownTimer = 0;
let abilityActive = false;
let abilityDuration = 0;

// Shield system
let shieldActive = false;
let shieldDuration = 0;
let shieldMaxDuration = 10; // 10 seconds

// ========================================
// INPUT HANDLING
// ========================================

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Prevent default for game keys
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'escape', 'x', 'c'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }
    
    // Handle ESC for pause/resume (works in both PLAYING and PAUSED states)
    if (e.key.toLowerCase() === 'escape') {
        if (currentState === GameState.PLAYING) {
            pauseGame();
            return;
        } else if (currentState === GameState.PAUSED) {
            resumeGame();
            return;
        }
    }
    
    // Other keys only work during gameplay
    if (currentState !== GameState.PLAYING) return;
    
    // Shoot
    if (e.key === ' ') {
        playerShoot();
    }
    
    // Missile
    if (e.key.toLowerCase() === 'x') {
        fireMissile();
    }
    
    // Ability
    if (e.key.toLowerCase() === 'c') {
        activateAbility();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// ========================================
// INITIALIZATION
// ========================================

function init() {
    // Calculate HUD boundary immediately on init
    setTimeout(() => {
        calculateHUDBoundary();
    }, 100); // Small delay to ensure HUD is rendered
    
    // Start loading
    showScreen('loadingScreen');
    simulateLoading();
}

function simulateLoading() {
    const loadingFill = document.getElementById('loadingFill');
    const loadingText = document.getElementById('loadingText');
    
    let progress = 0;
    let currentStep = 0;
    
    const interval = setInterval(() => {
        progress += 20;
        loadingFill.style.width = progress + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(async () => {
                try {
                    console.log('Checking for logged in user...');
                    const loggedInUser = localStorage.getItem('loggedInUser');
                    
                    if (loggedInUser) {
                        console.log('User logged in:', loggedInUser);
                        currentPlayer = loggedInUser;
                        
                        let profile = StorageManager.loadProfile(loggedInUser);
                        
                        if (!profile) {
                            console.log('Creating new profile');
                            profile = StorageManager.createDefaultProfile(loggedInUser);
                            StorageManager.saveProfile(profile);
                        }
                        
                        profile.username = loggedInUser;
                        currentProfile = profile;
                        
                        await syncCoinsFromBackend();
                        loadGameData();
                        showMainMenu();
                    } else {
                        console.log('No user logged in, redirecting...');
                        window.location.href = 'login.html';
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    window.location.href = 'login.html';
                }
            }, 300);
        }
    }, 200);
}

function checkLogin() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser) {
        console.log('No logged in user, redirecting to login');
        window.location.href = 'login.html';
        return;
    }
    
    const profile = StorageManager.loadProfile(loggedInUser);
    if (profile) {
        currentProfile = profile;
        currentProfile.lastLogin = Date.now();
        StorageManager.saveProfile(currentProfile);
        loadGameData();
        showMainMenu();
    } else {
        // Create new profile for this user
        currentProfile = StorageManager.createDefaultProfile(loggedInUser);
        StorageManager.saveProfile(currentProfile);
        loadGameData();
        showMainMenu();
    }
}

function loadGameData() {
    const username = currentProfile.username;
    currentProgress = StorageManager.loadProgress(username);
    currentFighters = StorageManager.loadFighters(username);
    currentInventory = StorageManager.loadInventory(username);
    currentSettings = StorageManager.loadSettings();
    console.log(`📁 Loaded game data for ${username}`);
}

// ========================================
// PLAYER
// ========================================

function createPlayer(fighterConfig) {
    const stats = fighterConfig.stats;
    
    // Calculate safe starting position (below HUD + buffer)
    const barrierY = Math.max(170, gameplayTopBoundary + 50);
    const safeHeight = canvas.height - barrierY;
    const startY = barrierY + (safeHeight / 2);
    
    return {
        x: 100,
        y: startY,
        width: CONFIG.player.width,
        height: CONFIG.player.height,
        speed: stats.speed + (upgrades.speed * stats.speed * 0.1),
        health: stats.maxHealth + (upgrades.health * 10),
        maxHealth: stats.maxHealth + (upgrades.health * 10),
        shootTimer: 0,
        shootCooldown: stats.shootCooldown,
        projectileDamage: stats.projectileDamage + (upgrades.damage * 2),
        fighterConfig: fighterConfig,
        invulnerable: false
    };
}

function updatePlayer(deltaTime) {
    if (!player) return;
    
    // Movement
    let dx = 0;
    let dy = 0;
    
    // Check for mobile controls first
    if (window.mobileControls && typeof window.mobileControls.isActive === 'function' && window.mobileControls.isActive()) {
        const joystick = window.mobileControls.getJoystick();
        if (joystick.active) {
            dx = joystick.x;
            dy = joystick.y;
        }
        
        // Auto-fire on mobile
        if (window.mobileControls.isFirePressed()) {
            if (player.shootTimer <= 0) {
                fireProjectile();
            }
        }
    } else {
        // Keyboard controls
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;
        
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
    }
    
    // Apply dash ability
    let speedMultiplier = 1;
    if (abilityActive && player.fighterConfig.ability.type === 'dash') {
        speedMultiplier = 3;
    }
    
    player.x += dx * player.speed * speedMultiplier * deltaTime;
    player.y += dy * player.speed * speedMultiplier * deltaTime;
    
    // Boundaries - respect HUD area at top
    // Use hardcoded minimum of 170px (increased by ~50px / half inch) if gameplayTopBoundary not yet calculated
    const minY = Math.max(170, gameplayTopBoundary + 50);
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(minY, Math.min(canvas.height - player.height, player.y));
    
    // Update timers
    if (player.shootTimer > 0) {
        player.shootTimer -= deltaTime;
    }
    
    // Update ability timers
    if (!abilityReady) {
        abilityCooldownTimer -= deltaTime;
        if (abilityCooldownTimer <= 0) {
            abilityReady = true;
            updateHUD();
        }
    }
    
    if (abilityActive) {
        abilityDuration -= deltaTime;
        if (abilityDuration <= 0) {
            deactivateAbility();
        }
    }
}

function drawPlayer() {
    if (!player) return;
    
    ctx.save();
    
    // Get fighter config
    const config = player.fighterConfig;
    const color = config.color;
    
    // Draw engine boost trails FIRST (behind the ship)
    drawEngineBoost(ctx, player.x, player.y, player.width, player.height, color, config.id);
    
    // Draw SHIELD if active
    if (shieldActive) {
        const shieldRadius = Math.max(player.width, player.height) * 0.8;
        const pulse = Math.sin(Date.now() / 100) * 0.1 + 0.9;
        const alpha = 0.3 + (shieldDuration / shieldMaxDuration) * 0.3;
        
        // Outer glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        const gradient = ctx.createRadialGradient(
            player.x + player.width / 2,
            player.y + player.height / 2,
            0,
            player.x + player.width / 2,
            player.y + player.height / 2,
            shieldRadius * pulse * 1.2
        );
        gradient.addColorStop(0, 'rgba(0, 170, 255, 0.5)');
        gradient.addColorStop(0.7, 'rgba(0, 200, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 170, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shieldRadius * pulse * 1.2,
            0,
            Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
        
        // Main shield circle
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00aaff';
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shieldRadius * pulse,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        
        // Inner shield circle
        ctx.strokeStyle = '#00ddff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            shieldRadius * pulse * 0.85,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
        
        // Shield energy particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (Date.now() / 500);
            const px = player.x + player.width / 2 + Math.cos(angle) * shieldRadius * pulse;
            const py = player.y + player.height / 2 + Math.sin(angle) * shieldRadius * pulse;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Invulnerability effect
    if (player.invulnerable || (abilityActive && 
        ['shield', 'phase', 'ghost', 'fortress', 'ironwall'].includes(config.ability.type))) {
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
    }
    
    // Draw based on fighter type - matching hangar designs
    drawFighterShape(ctx, player.x, player.y, player.width, player.height, color, config.id);
    
    // Dash trail
    if (abilityActive && config.ability.type === 'dash') {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        for (let i = 1; i <= 3; i++) {
            ctx.fillRect(player.x - i * 15, player.y, player.width, player.height);
        }
    }
    
    ctx.restore();
}

// Draw engine boost effects (animated trails)
function drawEngineBoost(ctx, x, y, width, height, color, fighterId) {
    const time = Date.now();
    const pulse = Math.sin(time / 100) * 0.3 + 0.7; // Pulsing effect
    
    ctx.save();
    
    const boostDesigns = {
        'FALCON': () => {
            // Standard orange engine glow
            ctx.fillStyle = '#ff6600';
            ctx.globalAlpha = pulse;
            const boostLength = 8 + Math.sin(time / 80) * 3;
            ctx.fillRect(x - boostLength, y + height * 0.4, boostLength, height * 0.2);
            // Inner bright core
            ctx.fillStyle = '#ffaa00';
            ctx.globalAlpha = pulse * 1.2;
            ctx.fillRect(x - boostLength * 0.6, y + height * 0.43, boostLength * 0.6, height * 0.14);
        },
        'THUNDER': () => {
            // Triple rapid-fire yellow thrusters
            ctx.fillStyle = '#ffff00';
            const boostLength = 6 + Math.sin(time / 60) * 2;
            ctx.globalAlpha = pulse;
            ctx.fillRect(x - boostLength, y + height * 0.3, boostLength, 3);
            ctx.fillRect(x - boostLength, y + height * 0.48, boostLength, 3);
            ctx.fillRect(x - boostLength, y + height * 0.66, boostLength, 3);
            // Bright cores
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = pulse * 1.3;
            ctx.fillRect(x - boostLength * 0.5, y + height * 0.31, boostLength * 0.5, 1);
            ctx.fillRect(x - boostLength * 0.5, y + height * 0.49, boostLength * 0.5, 1);
            ctx.fillRect(x - boostLength * 0.5, y + height * 0.67, boostLength * 0.5, 1);
        },
        'PHANTOM': () => {
            // Purple phase trail
            ctx.fillStyle = '#9900ff';
            ctx.globalAlpha = pulse * 0.7;
            const boostLength = 12 + Math.sin(time / 70) * 4;
            // Gradient effect
            for (let i = 0; i < 3; i++) {
                ctx.globalAlpha = pulse * (0.6 - i * 0.15);
                ctx.fillRect(x - boostLength + i * 3, y + height * 0.44, boostLength - i * 3, height * 0.12);
            }
        },
        'AEGIS': () => {
            // Dual green shield thrusters
            ctx.fillStyle = '#00ff88';
            ctx.globalAlpha = pulse;
            const boostLength = 7 + Math.sin(time / 90) * 2;
            ctx.fillRect(x - boostLength, y + height * 0.38, boostLength, height * 0.1);
            ctx.fillRect(x - boostLength, y + height * 0.52, boostLength, height * 0.1);
            // Glow
            ctx.fillStyle = '#00ffaa';
            ctx.globalAlpha = pulse * 1.2;
            ctx.fillRect(x - boostLength * 0.6, y + height * 0.4, boostLength * 0.6, height * 0.06);
            ctx.fillRect(x - boostLength * 0.6, y + height * 0.54, boostLength * 0.6, height * 0.06);
        },
        'VIPER': () => {
            // Pink missile engine glow
            ctx.fillStyle = '#ff0099';
            ctx.globalAlpha = pulse * 0.8;
            const boostLength = 10 + Math.sin(time / 75) * 3;
            // Radial glow effect
            const gradient = ctx.createRadialGradient(x, y + height/2, 0, x - boostLength, y + height/2, boostLength);
            gradient.addColorStop(0, 'rgba(255,0,153,0.9)');
            gradient.addColorStop(1, 'rgba(255,0,153,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(x - boostLength, y + height * 0.43, boostLength, height * 0.14);
        },
        'NOVA': () => {
            // Explosive orange pulse
            ctx.fillStyle = '#ff6600';
            const boostLength = 9 + Math.sin(time / 65) * 4;
            // Pulsing burst effect
            ctx.globalAlpha = pulse * 0.7;
            ctx.beginPath();
            ctx.arc(x - boostLength/2, y + height/2, boostLength, 0, Math.PI * 2);
            ctx.fill();
            // Inner bright burst
            ctx.fillStyle = '#ffaa00';
            ctx.globalAlpha = pulse * 1.1;
            ctx.beginPath();
            ctx.arc(x - boostLength/2, y + height/2, boostLength * 0.6, 0, Math.PI * 2);
            ctx.fill();
        },
        'TITAN': () => {
            // Heavy gray thrust - wide and powerful
            ctx.fillStyle = '#888888';
            ctx.globalAlpha = pulse;
            const boostLength = 10 + Math.sin(time / 110) * 2;
            ctx.fillRect(x - boostLength, y + height * 0.43, boostLength, height * 0.14);
            // Orange inner core
            ctx.fillStyle = '#ff6600';
            ctx.globalAlpha = pulse * 1.1;
            ctx.fillRect(x - boostLength * 0.7, y + height * 0.45, boostLength * 0.7, height * 0.1);
        },
        'SPECTER': () => {
            // Ghost purple fade trail
            ctx.fillStyle = '#6600ff';
            const boostLength = 11 + Math.sin(time / 70) * 3;
            // Fading ghost trail
            for (let i = 0; i < 4; i++) {
                ctx.globalAlpha = pulse * (0.5 - i * 0.1);
                ctx.fillRect(x - boostLength + i * 2.5, y + height * 0.44, boostLength - i * 2.5, height * 0.12);
            }
        },
        'COMET': () => {
            // Ultra-fast cyan speed streaks
            ctx.strokeStyle = '#00ddff';
            ctx.lineWidth = 2;
            const boostLength = 15 + Math.sin(time / 50) * 5;
            // Multiple speed lines
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.moveTo(x, y + height * 0.44);
            ctx.lineTo(x - boostLength, y + height * 0.4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + height * 0.5);
            ctx.lineTo(x - boostLength * 1.2, y + height * 0.5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + height * 0.56);
            ctx.lineTo(x - boostLength, y + height * 0.6);
            ctx.stroke();
            // Bright core
            ctx.fillStyle = '#00ddff';
            ctx.globalAlpha = pulse * 1.3;
            ctx.fillRect(x - 4, y + height * 0.46, 4, height * 0.08);
        },
        'OMEGA': () => {
            // Red power core pulse
            ctx.fillStyle = '#ff0000';
            const boostLength = 12 + Math.sin(time / 85) * 4;
            // Radial power pulse
            const gradient = ctx.createRadialGradient(x, y + height/2, 0, x - boostLength, y + height/2, boostLength);
            gradient.addColorStop(0, 'rgba(255,0,0,1)');
            gradient.addColorStop(0.6, 'rgba(255,100,0,0.7)');
            gradient.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = pulse;
            ctx.fillRect(x - boostLength, y + height * 0.35, boostLength, height * 0.3);
            // Bright center
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = pulse * 1.4;
            ctx.fillRect(x - 6, y + height * 0.43, 6, height * 0.14);
        }
    };
    
    // Use specific boost or default to FALCON
    const drawFunc = boostDesigns[fighterId] || boostDesigns['FALCON'];
    drawFunc();
    
    ctx.restore();
}

// Draw fighter-specific shapes (matching hangar SVG designs)
function drawFighterShape(ctx, x, y, width, height, color, fighterId) {
    const designs = {
        'FALCON': () => {
            // Classic balanced fighter - medium triangle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x, y);
            ctx.lineTo(x, y + height);
            ctx.closePath();
            ctx.fill();
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.6, y + height * 0.35, 8, height * 0.3);
            // Engine
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x - 5, y + height * 0.4, 5, height * 0.2);
        },
        'THUNDER': () => {
            // Rapid-fire - shorter, wider
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x, y + height * 0.25);
            ctx.lineTo(x, y + height * 0.75);
            ctx.closePath();
            ctx.fill();
            // Multiple barrels
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x - 5, y + height * 0.3, 5, 3);
            ctx.fillRect(x - 5, y + height * 0.48, 5, 3);
            ctx.fillRect(x - 5, y + height * 0.66, 5, 3);
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.55, y + height * 0.4, 6, height * 0.2);
        },
        'PHANTOM': () => {
            // Fast interceptor - sleek elongated
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x, y + height * 0.35);
            ctx.lineTo(x, y + height * 0.65);
            ctx.closePath();
            ctx.fill();
            // Side fins
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(x, y + height * 0.4);
            ctx.lineTo(x - 5, y + height * 0.45);
            ctx.lineTo(x, y + height * 0.5);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.5, y + height * 0.42, 5, height * 0.16);
            // Engine
            ctx.fillStyle = '#9900ff';
            ctx.fillRect(x - 4, y + height * 0.44, 4, height * 0.12);
        },
        'AEGIS': () => {
            // Defensive tank - hexagonal
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x + width * 0.6, y);
            ctx.lineTo(x, y + height * 0.2);
            ctx.lineTo(x, y + height * 0.8);
            ctx.lineTo(x + width * 0.6, y + height);
            ctx.lineTo(x + width, y + height/2);
            ctx.closePath();
            ctx.fill();
            // Shield panels
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.7;
            ctx.fillRect(x + 5, y + height * 0.25, width * 0.4, 6);
            ctx.fillRect(x + 5, y + height * 0.65, width * 0.4, 6);
            ctx.globalAlpha = 1;
            // Cockpit
            ctx.fillStyle = '#00ff88';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x + width * 0.45, y + height * 0.4, 8, height * 0.2);
            ctx.globalAlpha = 1;
            // Engine
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x - 5, y + height * 0.42, 5, height * 0.16);
        },
        'VIPER': () => {
            // Missile specialist with pods
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x, y + height * 0.15);
            ctx.lineTo(x, y + height * 0.85);
            ctx.closePath();
            ctx.fill();
            // Missile pods
            ctx.fillRect(x - 2, y, 6, height * 0.2);
            ctx.fillRect(x - 2, y + height * 0.8, 6, height * 0.2);
            // Missile tips
            ctx.fillStyle = '#ffaa00';
            ctx.beginPath();
            ctx.arc(x, y + height * 0.1, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y + height * 0.9, 3, 0, Math.PI * 2);
            ctx.fill();
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.5, y + height * 0.4, 7, height * 0.2);
            // Engine
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x - 5, y + height * 0.43, 5, height * 0.14);
        },
        'NOVA': () => {
            // Explosive specialist
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x + width * 0.3, y + height * 0.2);
            ctx.lineTo(x, y + height/2);
            ctx.lineTo(x + width * 0.3, y + height * 0.8);
            ctx.closePath();
            ctx.fill();
            // Explosion aura
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(x + width * 0.6, y + height/2, height * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.5, y + height * 0.42, 6, height * 0.16);
            // Engine
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x - 5, y + height * 0.44, 5, height * 0.12);
        },
        'TITAN': () => {
            // Heavy tank - rectangular
            ctx.fillStyle = color;
            // Main body
            ctx.fillRect(x, y + height * 0.2, width * 0.9, height * 0.6);
            // Side armor
            ctx.fillRect(x - 5, y + height * 0.15, width * 0.3, height * 0.7);
            ctx.fillRect(x + width * 0.65, y + height * 0.15, width * 0.3, height * 0.7);
            // Armor plates
            ctx.fillStyle = '#888888';
            ctx.fillRect(x + 5, y + height * 0.28, 12, 6);
            ctx.fillRect(x + 5, y + height * 0.65, 12, 6);
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.55, y + height * 0.42, 8, height * 0.16);
            // Engine
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(x - 8, y + height * 0.43, 6, height * 0.14);
        },
        'SPECTER': () => {
            // Stealth fighter - angular
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x + width * 0.4, y + height * 0.25);
            ctx.lineTo(x, y + height/2);
            ctx.lineTo(x + width * 0.4, y + height * 0.75);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
            // Stealth angles
            ctx.strokeStyle = '#6600ff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(x + width * 0.4, y + height * 0.25);
            ctx.lineTo(x + width * 0.6, y + height * 0.35);
            ctx.stroke();
            ctx.globalAlpha = 1;
            // Cockpit
            ctx.fillStyle = '#6600ff';
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x + width * 0.5, y + height * 0.42, 6, height * 0.16);
            ctx.globalAlpha = 1;
            // Engine
            ctx.fillStyle = '#6600ff';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(x - 5, y + height * 0.44, 5, height * 0.12);
            ctx.globalAlpha = 1;
        },
        'COMET': () => {
            // Ultra-fast needle
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x, y + height * 0.42);
            ctx.lineTo(x, y + height * 0.58);
            ctx.closePath();
            ctx.fill();
            // Speed trails
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(x, y + height * 0.44);
            ctx.lineTo(x - 10, y + height * 0.4);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y + height/2);
            ctx.lineTo(x - 12, y + height/2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.55, y + height * 0.45, 4, height * 0.1);
            // Engine
            ctx.fillStyle = '#00ddff';
            ctx.fillRect(x - 4, y + height * 0.46, 4, height * 0.08);
        },
        'OMEGA': () => {
            // Ultimate weapon
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x + width, y + height/2);
            ctx.lineTo(x + width * 0.2, y);
            ctx.lineTo(x, y + height/2);
            ctx.lineTo(x + width * 0.2, y + height);
            ctx.closePath();
            ctx.fill();
            // Weapon pods
            ctx.fillRect(x - 2, y, 8, height * 0.22);
            ctx.fillRect(x - 2, y + height * 0.78, 8, height * 0.22);
            // Cockpit
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x + width * 0.52, y + height * 0.4, 8, height * 0.2);
            // Engine (power core)
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(x - 6, y + height * 0.43, 6, height * 0.14);
        }
    };
    
    // Use specific design or default to FALCON
    const drawFunc = designs[fighterId] || designs['FALCON'];
    drawFunc();
}

function playerShoot() {
    if (!player || player.shootTimer > 0) return;
    
    // Rapid fire ability
    const shotsCount = (abilityActive && player.fighterConfig.ability.type === 'rapid') ? 3 : 1;
    
    for (let i = 0; i < shotsCount; i++) {
        const offsetY = (i - Math.floor(shotsCount / 2)) * 10;
        projectiles.push({
            x: player.x + player.width,
            y: player.y + player.height / 2 - CONFIG.projectile.height / 2 + offsetY,
            width: CONFIG.projectile.width,
            height: CONFIG.projectile.height,
            speed: CONFIG.projectile.speed,
            damage: player.projectileDamage
        });
    }
    
    player.shootTimer = player.shootCooldown;
    
    // Play laser sound
    Audio.play('laser', 0.4);
}

function fireMissile() {
    if (!player || missileCount <= 0) return;
    
    // Play missile sound
    Audio.play('missile', 0.6);
    
    // Find nearest valid target (priority: Boss > Enemies > Asteroids)
    let target = null;
    let minDist = Infinity;
    let targetType = null;
    
    // Priority 1: Boss (if exists and visible)
    if (boss && !boss.destroyed) {
        const dist = Math.hypot(boss.x + boss.width/2 - player.x, boss.y + boss.height/2 - player.y);
        if (dist < 1200) { // Lock range
            target = boss;
            minDist = dist;
            targetType = 'boss';
        }
    }
    
    // Priority 2: Regular enemies (if no boss or boss out of range)
    if (!target) {
        enemies.forEach(enemy => {
            if (enemy.isBossProjectile) return; // Don't target projectiles
            const dist = Math.hypot(enemy.x + enemy.width/2 - player.x, enemy.y + enemy.height/2 - player.y);
            if (dist < minDist && dist < 1000) { // Lock range
                minDist = dist;
                target = enemy;
                targetType = 'enemy';
            }
        });
    }
    
    // Priority 3: Asteroids (if no other targets)
    if (!target && asteroids.length > 0) {
        asteroids.forEach(asteroid => {
            const dist = Math.hypot(asteroid.x + asteroid.width/2 - player.x, asteroid.y + asteroid.height/2 - player.y);
            if (dist < minDist && dist < 800) { // Shorter range for asteroids
                minDist = dist;
                target = asteroid;
                targetType = 'asteroid';
            }
        });
    }
    
    // Calculate initial velocity towards target
    let initialVx = CONFIG.missile.speed;
    let initialVy = 0;
    
    if (target) {
        const dx = target.x + (target.width || 0)/2 - (player.x + player.width);
        const dy = target.y + (target.height || 0)/2 - (player.y + player.height/2);
        const angle = Math.atan2(dy, dx);
        initialVx = Math.cos(angle) * CONFIG.missile.speed;
        initialVy = Math.sin(angle) * CONFIG.missile.speed;
    }
    
    missiles.push({
        x: player.x + player.width,
        y: player.y + player.height / 2 - CONFIG.missile.height / 2,
        width: CONFIG.missile.width,
        height: CONFIG.missile.height,
        speed: CONFIG.missile.speed,
        damage: player.fighterConfig.stats.missileDamage,
        target: target,
        targetType: targetType,
        locked: target ? true : false,
        vx: initialVx,
        vy: initialVy,
        trailParticles: []
    });
    
    missileCount--;
    updateHUD();
    
    // Visual/audio feedback for lock
    if (target) {
        // Create lock-on indicator
        createLockOnIndicator(target);
    }
}

function activateAbility() {
    if (!player || !abilityReady || abilityActive) return;
    
    const ability = player.fighterConfig.ability;
    
    abilityActive = true;
    abilityReady = false;
    abilityDuration = ability.duration;
    abilityCooldownTimer = ability.cooldown;
    
    // Special instant abilities
    if (ability.type === 'barrage') {
        // Fire 5 homing missiles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => fireMissile(), i * 100);
        }
        abilityActive = false;
    } else if (ability.type === 'supernova') {
        // Damage all enemies
        enemies.forEach(enemy => {
            damageEnemy(enemy, 100);
        });
        if (boss && !boss.destroyed) {
            damageBoss(200);
        }
        createParticles(canvas.width / 2, canvas.height / 2, 50, '#ff6600');
        abilityActive = false;
    } else if (ability.type === 'omega') {
        // Activate beam
        player.beamActive = true;
        setTimeout(() => {
            player.beamActive = false;
        }, ability.duration * 1000);
    }
    
    updateHUD();
}

function deactivateAbility() {
    abilityActive = false;
    abilityDuration = 0;
}

function damagePlayer(amount) {
    if (!player) return;
    
    // Shield blocks all damage
    if (shieldActive) {
        console.log('Damage blocked by shield!');
        createParticles(player.x + player.width / 2, player.y + player.height / 2, 5, '#00aaff');
        Audio.play('shield', 0.5);
        return; // No damage taken
    }
    
    // Check invulnerability
    if (player.invulnerable) return;
    if (abilityActive && ['shield', 'phase', 'ghost'].includes(player.fighterConfig.ability.type)) return;
    
    // Apply damage reduction
    if (abilityActive && player.fighterConfig.ability.type === 'fortress') {
        amount *= 0.3;
    } else if (abilityActive && player.fighterConfig.ability.type === 'ironwall') {
        amount *= 0.2;
    }
    
    player.health -= amount;
    playerHealth = player.health; // Sync playerHealth with player.health
    updateHUD();
    
    createParticles(player.x + player.width / 2, player.y + player.height / 2, 5, '#ff0000');
    Audio.play('hit', 0.7);
    
    if (player.health <= 0) {
        gameOver();
    }
}

// ========================================
// PROJECTILES
// ========================================

function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        proj.x += proj.speed * deltaTime;
        
        // Remove if off right edge
        if (proj.x > canvas.width) {
            projectiles.splice(i, 1);
            continue;
        }
        
        // Remove if projectile enters HUD area (hits the barrier)
        if (proj.y < gameplayTopBoundary) {
            projectiles.splice(i, 1);
            createParticles(proj.x, proj.y, 4, '#ffff00');
        }
    }
}

function drawProjectiles() {
    ctx.fillStyle = '#ffff00';
    projectiles.forEach(proj => {
        ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        
        // Trail
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(proj.x - 10, proj.y, 10, proj.height);
        ctx.fillStyle = '#ffff00';
    });
}

// ========================================
// MISSILES
// ========================================

function updateMissiles(deltaTime) {
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        
        // Retarget if current target is destroyed or out of range
        if (!missile.target || missile.target.destroyed) {
            missile.locked = false;
            missile.target = null;
            
            // Auto-retarget to nearest valid target
            let newTarget = null;
            let minDist = Infinity;
            
            // Check boss first
            if (boss && !boss.destroyed) {
                const dist = Math.hypot(boss.x + boss.width/2 - missile.x, boss.y + boss.height/2 - missile.y);
                if (dist < 800) {
                    newTarget = boss;
                    minDist = dist;
                    missile.targetType = 'boss';
                }
            }
            
            // Check enemies
            if (!newTarget) {
                enemies.forEach(enemy => {
                    if (enemy.isBossProjectile) return;
                    const dist = Math.hypot(enemy.x + enemy.width/2 - missile.x, enemy.y + enemy.height/2 - missile.y);
                    if (dist < minDist && dist < 600) {
                        minDist = dist;
                        newTarget = enemy;
                        missile.targetType = 'enemy';
                    }
                });
            }
            
            // Check asteroids
            if (!newTarget && asteroids.length > 0) {
                asteroids.forEach(asteroid => {
                    const dist = Math.hypot(asteroid.x + asteroid.width/2 - missile.x, asteroid.y + asteroid.height/2 - missile.y);
                    if (dist < minDist && dist < 500) {
                        minDist = dist;
                        newTarget = asteroid;
                        missile.targetType = 'asteroid';
                    }
                });
            }
            
            if (newTarget) {
                missile.target = newTarget;
                missile.locked = true;
            }
        }
        
        // Enhanced homing behavior
        if (missile.target && missile.locked && !missile.target.destroyed) {
            const targetCenterX = missile.target.x + (missile.target.width || 0) / 2;
            const targetCenterY = missile.target.y + (missile.target.height || 0) / 2;
            
            const dx = targetCenterX - missile.x;
            const dy = targetCenterY - missile.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist > 0) {
                // Strong homing with smooth turning
                const homingForce = CONFIG.missile.homingStrength * 1.5; // 1.5x stronger
                missile.vx += (dx / dist) * homingForce;
                missile.vy += (dy / dist) * homingForce;
                
                // Normalize to maintain speed
                const currentSpeed = Math.hypot(missile.vx, missile.vy);
                const targetSpeed = missile.speed * 1.2; // 20% faster when locked
                missile.vx = (missile.vx / currentSpeed) * targetSpeed;
                missile.vy = (missile.vy / currentSpeed) * targetSpeed;
            }
        } else {
            // No target - fly straight but slow down
            missile.speed = Math.max(missile.speed * 0.98, CONFIG.missile.speed * 0.7);
        }
        
        missile.x += missile.vx * deltaTime;
        missile.y += missile.vy * deltaTime;
        
        // Add trail particle
        if (Math.random() < 0.3) {
            missile.trailParticles = missile.trailParticles || [];
            missile.trailParticles.push({
                x: missile.x,
                y: missile.y + missile.height / 2,
                life: 0.3,
                size: 3
            });
        }
        
        // Update trail particles
        if (missile.trailParticles) {
            for (let j = missile.trailParticles.length - 1; j >= 0; j--) {
                missile.trailParticles[j].life -= deltaTime;
                if (missile.trailParticles[j].life <= 0) {
                    missile.trailParticles.splice(j, 1);
                }
            }
        }
        
        // Remove if off screen or enters HUD area
        if (missile.x > canvas.width + 50 || missile.x < -50 || 
            missile.y > canvas.height + 50 || missile.y < gameplayTopBoundary - 50) {
            missiles.splice(i, 1);
            if (missile.y < gameplayTopBoundary) {
                createParticles(missile.x, missile.y, 6, '#ff6600');
            }
        }
    }
}

function drawMissiles() {
    missiles.forEach(missile => {
        ctx.save();
        
        // Draw trail particles first
        if (missile.trailParticles) {
            missile.trailParticles.forEach(particle => {
                const alpha = particle.life / 0.3;
                ctx.fillStyle = `rgba(255, 140, 0, ${alpha * 0.7})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }
        
        // Calculate missile rotation based on velocity
        const angle = Math.atan2(missile.vy, missile.vx);
        
        // Translate and rotate
        ctx.translate(missile.x + missile.width / 2, missile.y + missile.height / 2);
        ctx.rotate(angle);
        
        // Missile body
        ctx.fillStyle = '#cc3300';
        ctx.fillRect(-missile.width / 2, -missile.height / 2, missile.width, missile.height);
        
        // Missile nose (pointed tip)
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(missile.width / 2, 0);
        ctx.lineTo(missile.width / 2 + 8, -missile.height / 2 - 1);
        ctx.lineTo(missile.width / 2 + 8, missile.height / 2 + 1);
        ctx.closePath();
        ctx.fill();
        
        // Fins
        ctx.fillStyle = '#990000';
        ctx.fillRect(-missile.width / 2 - 2, -missile.height / 2 - 2, 4, 2);
        ctx.fillRect(-missile.width / 2 - 2, missile.height / 2, 4, 2);
        
        // Engine glow (stronger when locked)
        const glowSize = missile.locked ? 5 : 3;
        const glowColor = missile.locked ? '#ffff00' : '#ffaa00';
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(-missile.width / 2 - 2, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Lock indicator on missile
        if (missile.locked) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 1;
            ctx.strokeRect(-missile.width / 2 - 2, -missile.height / 2 - 2, missile.width + 4, missile.height + 4);
        }
        
        ctx.restore();
        
        // Draw lock-on line to target
        if (missile.locked && missile.target && !missile.target.destroyed) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(missile.x + missile.width / 2, missile.y + missile.height / 2);
            const targetX = missile.target.x + (missile.target.width || 0) / 2;
            const targetY = missile.target.y + (missile.target.height || 0) / 2;
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
            
            // Draw target reticle
            drawTargetReticle(missile.target);
        }
    });
}

// Draw targeting reticle on locked target
function drawTargetReticle(target) {
    if (!target || target.destroyed) return;
    
    ctx.save();
    const centerX = target.x + (target.width || 0) / 2;
    const centerY = target.y + (target.height || 0) / 2;
    const size = Math.max(target.width || 40, target.height || 40) / 2 + 10;
    
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    // Animated pulsing reticle
    const pulse = Math.sin(Date.now() / 100) * 3;
    const currentSize = size + pulse;
    
    // Corner brackets
    const bracketSize = 8;
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(centerX - currentSize, centerY - currentSize + bracketSize);
    ctx.lineTo(centerX - currentSize, centerY - currentSize);
    ctx.lineTo(centerX - currentSize + bracketSize, centerY - currentSize);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(centerX + currentSize - bracketSize, centerY - currentSize);
    ctx.lineTo(centerX + currentSize, centerY - currentSize);
    ctx.lineTo(centerX + currentSize, centerY - currentSize + bracketSize);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(centerX - currentSize, centerY + currentSize - bracketSize);
    ctx.lineTo(centerX - currentSize, centerY + currentSize);
    ctx.lineTo(centerX - currentSize + bracketSize, centerY + currentSize);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(centerX + currentSize - bracketSize, centerY + currentSize);
    ctx.lineTo(centerX + currentSize, centerY + currentSize);
    ctx.lineTo(centerX + currentSize, centerY + currentSize - bracketSize);
    ctx.stroke();
    
    // Center crosshair
    ctx.beginPath();
    ctx.moveTo(centerX - 5, centerY);
    ctx.lineTo(centerX + 5, centerY);
    ctx.moveTo(centerX, centerY - 5);
    ctx.lineTo(centerX, centerY + 5);
    ctx.stroke();
    
    // "LOCKED" text
    ctx.fillStyle = '#00ff00';
    ctx.font = '10px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('LOCKED', centerX, centerY + currentSize + 15);
    
    ctx.restore();
}

// Create lock-on visual indicator
function createLockOnIndicator(target) {
    if (!target) return;
    
    const centerX = target.x + (target.width || 0) / 2;
    const centerY = target.y + (target.height || 0) / 2;
    
    // Create expanding lock ring particles
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        particles.push({
            x: centerX,
            y: centerY,
            vx: Math.cos(angle) * 100,
            vy: Math.sin(angle) * 100,
            life: 0.5,
            maxLife: 0.5,
            color: '#00ff00',
            size: 3,
            glow: true
        });
    }
}

// Continued in next message due to length...

// ========================================
// ENEMIES
// ========================================

function spawnEnemy() {
    // Calculate safe spawn area (below HUD + buffer, above bottom)
    const barrierY = Math.max(170, gameplayTopBoundary + 50);
    const safeHeight = canvas.height - barrierY - CONFIG.enemy.height;
    const y = barrierY + (Math.random() * safeHeight);
    const difficulty = (currentLevel ? currentLevel.enemyConfig.scoreMultiplier : 1) * gameDifficultyMultiplier;
    
    enemies.push({
        x: canvas.width,
        y: y,
        width: CONFIG.enemy.width,
        height: CONFIG.enemy.height,
        speed: CONFIG.enemy.baseSpeed * difficulty,
        health: CONFIG.enemy.baseHealth * difficulty,
        maxHealth: CONFIG.enemy.baseHealth * difficulty,
        scoreValue: CONFIG.enemy.baseScoreValue * difficulty,
        destroyed: false
    });
}

function updateEnemies(deltaTime) {
    // Spawn enemies even if boss is active (removed boss check)
    const spawnRate = currentLevel ? currentLevel.enemyConfig.spawnRate : CONFIG.enemy.baseSpawnRate;
    enemySpawnTimer += deltaTime;
    if (enemySpawnTimer >= spawnRate) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }
    
    // Update positions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Boss projectiles and homing missiles use velocity-based movement
        if (enemy.isBossProjectile || enemy.isHoming) {
            // Homing missile behavior
            if (enemy.isHoming && player) {
                const dx = player.x + player.width / 2 - enemy.x;
                const dy = player.y + player.height / 2 - enemy.y;
                const targetAngle = Math.atan2(dy, dx);
                const currentAngle = Math.atan2(enemy.vy, enemy.vx);
                
                // Gradually turn towards player
                let angleDiff = targetAngle - currentAngle;
                // Normalize angle difference to -PI to PI
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                const turnRate = enemy.homingStrength * deltaTime;
                const newAngle = currentAngle + Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), turnRate);
                
                enemy.vx = Math.cos(newAngle) * enemy.speed;
                enemy.vy = Math.sin(newAngle) * enemy.speed;
            }
            
            enemy.x += enemy.vx * deltaTime;
            enemy.y += enemy.vy * deltaTime;
        } else {
            // Regular enemies move left
            enemy.x -= enemy.speed * deltaTime;
        }
        
        // Remove if off screen
        if (enemy.x + enemy.width < 0 || enemy.x > canvas.width + 100 || 
            enemy.y + enemy.height < 0 || enemy.y > canvas.height) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Collision with HUD boundary - destroy enemy if it enters HUD area
        if (enemy.y < gameplayTopBoundary && !enemy.isBossProjectile) {
            enemies.splice(i, 1);
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8, '#ff6600');
        }
    }
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.destroyed) return;
        
        // Boss projectiles get special visual
        if (enemy.isBossProjectile) {
            ctx.save();
            
            // Homing missile visual
            if (enemy.isHoming) {
                ctx.save();
                const angle = Math.atan2(enemy.vy, enemy.vx);
                ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                ctx.rotate(angle);
                
                // Missile body
                ctx.fillStyle = '#cc3300';
                ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
                
                // Nose cone
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.moveTo(enemy.width / 2, 0);
                ctx.lineTo(enemy.width / 2 + 6, -enemy.height / 2);
                ctx.lineTo(enemy.width / 2 + 6, enemy.height / 2);
                ctx.closePath();
                ctx.fill();
                
                // Fins
                ctx.fillStyle = '#990000';
                ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 3, 4, 3);
                ctx.fillRect(-enemy.width / 2, enemy.height / 2, 4, 3);
                
                // Engine trail
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.arc(-enemy.width / 2 - 4, 0, 3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            } else {
                // Energy projectile with custom color
                const projectileColor = enemy.color || '#ff6600';
                
                // Glowing energy ball
                ctx.fillStyle = projectileColor;
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Glow effect
                const glowColor = projectileColor === '#ffff00' ? 'rgba(255, 255, 100, 0.6)' : 'rgba(255, 200, 0, 0.5)';
                ctx.fillStyle = glowColor;
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2 + 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Inner bright core
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 4, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            return;
        }
        
        // Regular enemy body
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width * 0.2, enemy.y);
        ctx.lineTo(enemy.x + enemy.width * 0.8, enemy.y);
        ctx.lineTo(enemy.x + enemy.width, enemy.y + enemy.height * 0.5);
        ctx.lineTo(enemy.x + enemy.width * 0.8, enemy.y + enemy.height);
        ctx.lineTo(enemy.x + enemy.width * 0.2, enemy.y + enemy.height);
        ctx.lineTo(enemy.x, enemy.y + enemy.height * 0.5);
        ctx.closePath();
        ctx.fill();
        
        // Core
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(enemy.x + enemy.width * 0.4, enemy.y + enemy.height * 0.4, 
                    enemy.width * 0.2, enemy.height * 0.2);
        
        // Health bar (not for projectiles)
        const healthPercent = enemy.health / enemy.maxHealth;
        if (healthPercent < 1 && enemy.maxHealth > 1) {
            ctx.fillStyle = '#333';
            ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
        }
    });
}

function damageEnemy(enemy, damage) {
    if (enemy.destroyed) return;
    
    enemy.health -= damage;
    
    if (enemy.health <= 0) {
        destroyEnemy(enemy);
    }
}

function destroyEnemy(enemy) {
    if (enemy.destroyed) return;
    
    enemy.destroyed = true;
    const index = enemies.indexOf(enemy);
    if (index > -1) {
        enemies.splice(index, 1);
    }
    
    score += enemy.scoreValue;
    targetsDestroyed++;
    updateHUD();
    
    createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 15, '#ff6600');
    Audio.play('explosion', 0.5);
    
    // Try to spawn powerup
    trySpawnPowerupFromEnemy(enemy);
    
    // Quick Play: Spawn boss after X targets destroyed
    if (currentGameMode === GameMode.QUICK_PLAY && !bossSpawned && targetsDestroyed >= (20 + bossesDefeated * 30)) {
        bossSpawned = true;
        
        // Determine which boss to spawn based on bosses defeated
        let bossType;
        switch(bossesDefeated) {
            case 0: bossType = 'ASTEROID_KING'; break;      // 20 kills
            case 1: bossType = 'VOID_SERPENT'; break;       // 50 kills
            case 2: bossType = 'PLASMA_TITAN'; break;       // 100 kills
            case 3: bossType = 'SHADOW_REAPER'; break;      // 150 kills
            case 4: bossType = 'OMEGA_DESTROYER'; break;    // 200 kills (FINAL)
            default: bossType = 'OMEGA_DESTROYER'; break;   // Keep spawning final boss
        }
        
        setTimeout(() => {
            spawnBoss(bossType);
        }, 2000);
    }
}

function damageUFO(ufo, damage) {
    if (ufo.destroyed) return;
    
    ufo.health -= damage;
    createParticles(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, 3, '#00ffaa');
    
    if (ufo.health <= 0) {
        destroyUFO(ufo);
    }
}

function destroyUFO(ufo) {
    if (ufo.destroyed) return;
    
    ufo.destroyed = true;
    const index = ufos.indexOf(ufo);
    if (index > -1) {
        ufos.splice(index, 1);
    }
    
    score += ufo.scoreValue;
    targetsDestroyed++;
    updateHUD();
    
    createExplosion(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, 20, '#00ffaa');
    createParticles(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, 20, '#00ffff');
    
    // Try to spawn powerup
    trySpawnPowerupFromEnemy({ x: ufo.x, y: ufo.y, width: ufo.width, height: ufo.height });
}

// ========================================
// UFO ENEMIES
// ========================================

function spawnUFO() {
    // Calculate safe spawn area (below HUD + buffer, above bottom)
    const barrierY = Math.max(170, gameplayTopBoundary + 50);
    const safeHeight = canvas.height - barrierY - CONFIG.ufo.height;
    const y = barrierY + (Math.random() * safeHeight);
    const difficulty = (currentLevel ? currentLevel.enemyConfig.scoreMultiplier : 1) * gameDifficultyMultiplier;
    
    ufos.push({
        x: canvas.width,
        y: y,
        width: CONFIG.ufo.width,
        height: CONFIG.ufo.height,
        speed: CONFIG.ufo.baseSpeed * difficulty,
        health: CONFIG.ufo.baseHealth * difficulty,
        maxHealth: CONFIG.ufo.baseHealth * difficulty,
        scoreValue: CONFIG.ufo.baseScoreValue * difficulty,
        shootTimer: 0,
        shootCooldown: CONFIG.ufo.shootCooldown,
        destroyed: false,
        hover: Math.random() * Math.PI * 2 // For hovering animation
    });
}

function updateUFOs(deltaTime) {
    // UFOs only spawn after game gets harder:
    // - After 30 targets destroyed OR
    // - After 60 seconds of gameplay OR
    // - When boss has been defeated at least once
    const shouldSpawnUFOs = targetsDestroyed >= 30 || playTime >= 60 || bossesDefeated > 0;
    
    if (!shouldSpawnUFOs) {
        return; // Don't spawn UFOs in early game
    }
    
    // Spawn UFOs
    const spawnRate = CONFIG.ufo.baseSpawnRate;
    ufoSpawnTimer += deltaTime;
    if (ufoSpawnTimer >= spawnRate) {
        spawnUFO();
        ufoSpawnTimer = 0;
    }
    
    // Update UFO positions and behavior
    for (let i = ufos.length - 1; i >= 0; i--) {
        const ufo = ufos[i];
        
        // Move left
        ufo.x -= ufo.speed * deltaTime;
        
        // Hovering motion (sine wave)
        ufo.hover += deltaTime * 2;
        const hoverOffset = Math.sin(ufo.hover) * 20;
        
        // Shoot at player
        ufo.shootTimer += deltaTime;
        if (ufo.shootTimer >= ufo.shootCooldown && player) {
            // Fire projectile at player
            const angle = Math.atan2(
                player.y + player.height / 2 - (ufo.y + ufo.height / 2),
                player.x + player.width / 2 - (ufo.x + ufo.width / 2)
            );
            
            createBossProjectile(
                ufo.x, 
                ufo.y + ufo.height / 2 + hoverOffset, 
                angle, 
                250, 
                '#00ffaa'
            );
            
            ufo.shootTimer = 0;
        }
        
        // Remove if off-screen
        if (ufo.x + ufo.width < 0) {
            ufos.splice(i, 1);
            continue;
        }
        
        // Collision with HUD boundary
        if (ufo.y < gameplayTopBoundary) {
            ufos.splice(i, 1);
            createParticles(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, 8, '#00ffaa');
        }
    }
}

function drawUFOs() {
    ufos.forEach(ufo => {
        if (ufo.destroyed) return;
        
        ctx.save();
        
        const cx = ufo.x + ufo.width / 2;
        const cy = ufo.y + ufo.height / 2 + Math.sin(ufo.hover) * 20;
        
        // UFO saucer shape
        ctx.fillStyle = '#00ffaa';
        ctx.globalAlpha = 0.9;
        
        // Top dome
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Main saucer disc
        ctx.fillStyle = '#00ccaa';
        ctx.beginPath();
        ctx.ellipse(cx, cy, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow ring
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6 + Math.sin(ufo.hover * 3) * 0.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2, 22, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Windows/lights
        ctx.fillStyle = '#ffff00';
        ctx.globalAlpha = 0.8;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const lx = cx + Math.cos(angle) * 18;
            const ly = cy + Math.sin(angle) * 8;
            ctx.beginPath();
            ctx.arc(lx, ly, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.restore();
        
        // Health bar
        if (ufo.health < ufo.maxHealth) {
            const barWidth = ufo.width;
            const barHeight = 4;
            const barX = ufo.x;
            const barY = ufo.y - 10;
            
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#00ff00';
            const healthWidth = (ufo.health / ufo.maxHealth) * barWidth;
            ctx.fillRect(barX, barY, healthWidth, barHeight);
        }
    });
}

// ========================================
// BOSS
// ========================================

function spawnBoss(bossConfig) {
    const bossHeight = BOSSES[bossConfig].height;
    // Calculate safe spawn area (below HUD + buffer, above bottom)
    const barrierY = Math.max(170, gameplayTopBoundary + 50);
    const safeHeight = canvas.height - barrierY - bossHeight;
    const centerY = barrierY + (safeHeight / 2);
    
    // Play boss spawn sound effect
    Audio.play('bossSpawn', 1.0);
    
    boss = {
        ...BOSSES[bossConfig],
        x: canvas.width - 200,
        y: centerY,
        health: BOSSES[bossConfig].health * gameDifficultyMultiplier,
        maxHealth: BOSSES[bossConfig].health * gameDifficultyMultiplier,
        speed: BOSSES[bossConfig].speed * (1 + (gameDifficultyMultiplier - 1) * 0.5), // Speed increases slower
        destroyed: false,
        attackTimer: 0,
        moveTimer: 0,
        targetY: centerY,
        // Store boundaries for boss movement
        minY: barrierY,
        maxY: canvas.height - bossHeight,
        // Boss states based on the image
        state: 'idle', // idle, rotate_l, rotate_r, energy_boost, fragment_fire, charging, plasma_blast, missile_salvo, shield_up, defeat
        stateTimer: 0,
        rotation: 0,
        charging: false,
        chargeProgress: 0,
        shielded: false,
        shieldHealth: 0,
        fragments: []
    };
    
    updateHUD();
    document.getElementById('bossHealthContainer').style.display = 'flex';
}

function updateBoss(deltaTime) {
    if (!boss || boss.destroyed) return;
    
    // Movement
    boss.moveTimer += deltaTime;
    if (boss.moveTimer >= 2) {
        // Choose new target Y within safe boundaries
        const safeHeight = boss.maxY - boss.minY;
        boss.targetY = boss.minY + (Math.random() * safeHeight);
        boss.moveTimer = 0;
    }
    
    const dy = boss.targetY - boss.y;
    if (Math.abs(dy) > 5) {
        boss.y += Math.sign(dy) * boss.speed * deltaTime;
    }
    
    // Keep in bounds (use stored boundaries)
    boss.y = Math.max(boss.minY, Math.min(boss.maxY, boss.y));
    
    // Idle rotation animation
    if (boss.state === 'idle' || boss.state === 'rotate_l' || boss.state === 'rotate_r') {
        if (boss.state === 'rotate_l') {
            boss.rotation -= deltaTime * 2;
        } else if (boss.state === 'rotate_r') {
            boss.rotation += deltaTime * 2;
        } else {
            boss.rotation += deltaTime * 0.5;
        }
    }
    
    // Update fragments
    if (boss.fragments.length > 0) {
        boss.fragments.forEach((frag, idx) => {
            frag.x += frag.vx * deltaTime;
            frag.y += frag.vy * deltaTime;
            frag.life -= deltaTime;
            
            // Remove dead fragments
            if (frag.life <= 0) {
                boss.fragments.splice(idx, 1);
            }
        });
    }
    
    // State management
    boss.stateTimer += deltaTime;
    
    // Attacks based on state
    boss.attackTimer += deltaTime;
    if (boss.attackTimer >= 2.5) {
        bossAttack();
        boss.attackTimer = 0;
    }
    
    // Charging laser special attack (15% damage)
    if (boss.charging) {
        boss.chargeProgress += deltaTime * 0.5;
        if (boss.chargeProgress >= 0.99) { // Changed from 1.0 to 0.99 to prevent freeze
            fireLaserBlast();
            boss.charging = false;
            boss.chargeProgress = 0;
            boss.state = 'idle';
        }
    }
}

function bossAttack() {
    if (!boss || boss.destroyed || !player) return;
    
    // Different attack patterns based on boss ability
    const ability = boss.ability || 'laser'; // Default to laser if no ability specified
    
    switch(ability) {
        case 'spiral_shots':
            // VOID SERPENT - Spiral projectiles
            boss.state = 'charging';
            boss.charging = true;
            boss.chargeProgress = 0;
            for (let i = 0; i < 12; i++) {
                setTimeout(() => {
                    if (boss && !boss.destroyed) {
                        const angle = (i / 12) * Math.PI * 2 + (Date.now() / 500);
                        createBossProjectile(boss.x, boss.y + boss.height / 2, angle, 200, '#9900ff');
                    }
                }, i * 100);
            }
            break;
            
        case 'energy_waves':
            // PLASMA TITAN - Energy waves
            boss.state = 'charging';
            boss.charging = true;
            boss.chargeProgress = 0;
            for (let wave = 0; wave < 3; wave++) {
                setTimeout(() => {
                    if (boss && !boss.destroyed) {
                        for (let i = -2; i <= 2; i++) {
                            createBossProjectile(
                                boss.x, 
                                boss.y + boss.height / 2 + (i * 30), 
                                Math.PI, 
                                250 - (wave * 30), 
                                '#00ff99'
                            );
                        }
                    }
                }, wave * 400);
            }
            break;
            
        case 'teleport_attack':
            // SHADOW REAPER - Teleport and attack
            boss.state = 'charging';
            const oldY = boss.y;
            const newY = boss.minY + Math.random() * (boss.maxY - boss.minY);
            boss.y = newY;
            boss.charging = true;
            boss.chargeProgress = 0;
            // Fire after teleport
            setTimeout(() => {
                if (boss && !boss.destroyed) {
                    for (let i = 0; i < 8; i++) {
                        const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (i - 4) * 0.2;
                        createBossProjectile(boss.x, boss.y + boss.height / 2, angle, 300, '#220033');
                    }
                }
            }, 300);
            break;
            
        case 'multi_attack':
            // OMEGA DESTROYER - Multiple attacks (HARD MODE)
            boss.state = 'charging';
            boss.charging = true;
            boss.chargeProgress = 0;
            // Combination attack: laser + missiles + projectiles
            setTimeout(() => {
                if (boss && !boss.destroyed) {
                    // Rapid projectiles
                    for (let i = 0; i < 16; i++) {
                        setTimeout(() => {
                            if (boss && !boss.destroyed) {
                                const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (Math.random() - 0.5) * 0.5;
                                createBossProjectile(boss.x, boss.y + boss.height / 2, angle, 350, '#ff3300');
                            }
                        }, i * 50);
                    }
                }
            }, 200);
            break;
            
        case 'champion_mode':
            // ARENA CHAMPION - Fast tracking missiles
            boss.state = 'charging';
            boss.charging = true;
            boss.chargeProgress = 0;
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    if (boss && !boss.destroyed && player) {
                        createHomingMissile(boss.x, boss.y + boss.height / 2);
                    }
                }, i * 200);
            }
            break;
            
        default:
            // Default: Laser attack (ASTEROID KING and Adventure bosses)
            boss.state = 'charging';
            boss.charging = true;
            boss.chargeProgress = 0;
            break;
    }
}

// Attack patterns
function spreadShotAttack(count, spread) {
    if (!boss || !player) return;
    for (let i = 0; i < count; i++) {
        const angle = Math.atan2(player.y - boss.y, player.x - boss.x) + (i - count/2) * spread;
        createBossProjectile(boss.x, boss.y + boss.height / 2, angle, 280, '#ff8800');
    }
}

function rapidFireAttack() {
    if (!boss || !player) return;
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            if (boss && !boss.destroyed && player) {
                const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
                createBossProjectile(boss.x, boss.y + boss.height / 2, angle, 350, '#ffaa00');
            }
        }, i * 60);
    }
}

function fragmentFireAttack() {
    if (!boss) return;
    const cx = boss.x + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    
    // Create visible fragments
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        boss.fragments.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * 150,
            vy: Math.sin(angle) * 150,
            size: 8 + Math.random() * 8,
            life: 2.0,
            rotation: Math.random() * Math.PI * 2
        });
    }
    
    // Create damaging projectiles
    for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
        createBossProjectile(cx, cy, angle, 200 + Math.random() * 100, '#cc6600');
    }
}

function plasmaBlastAttack() {
    if (!boss || !player) return;
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    
    // Create a wide beam effect with multiple projectiles
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (boss && !boss.destroyed) {
                for (let j = -2; j <= 2; j++) {
                    createBossProjectile(
                        boss.x - 20, 
                        boss.y + boss.height / 2 + j * 10, 
                        angle + j * 0.05, 
                        400, 
                        '#ffff00',
                        20 + Math.abs(j) * 3
                    );
                }
            }
        }, i * 50);
    }
}

function missileSalvoAttack() {
    if (!boss || !player) return;
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            if (boss && !boss.destroyed && player) {
                const offsetY = (i - 2.5) * 15;
                createHomingMissile(boss.x, boss.y + boss.height / 2 + offsetY);
            }
        }, i * 150);
    }
}

function fireLaserBlast() {
    if (!boss) return;
    
    // Play boss laser sound effect
    Audio.play('bossLaser', 1.0);
    
    // Calculate laser starting point
    const bossX = boss.x + boss.width / 2;
    const bossY = boss.y + boss.height / 2;
    
    // HORIZONTAL LASER - shoot straight to the left (toward player side)
    const targetX = 0; // Left edge of screen
    const targetY = bossY; // Same Y level as boss
    
    // Create visible laser beam
    createLaserBeam(bossX, bossY, targetX, targetY);
    
    // Check if laser hits player (line collision detection)
    if (player && checkLaserHitPlayer(bossX, bossY, targetX, targetY)) {
        // Laser hits player for 15% of their max health
        const maxHealth = player.fighterConfig.stats.maxHealth;
        const laserDamage = Math.floor(maxHealth * 0.15);
        player.health = Math.max(0, player.health - laserDamage);
        playerHealth = player.health; // Sync both health variables
        updateHUD();
        
        // Visual effect at player position
        const playerX = player.x + player.width / 2;
        const playerY = player.y + player.height / 2;
        createExplosion(playerX, playerY, 40, '#ffff00');
        createExplosion(playerX, playerY, 20, '#ffffff');
        
        // Screen shake
        screenShake(15);
        
        // Create impact flash
        particles.push({
            x: playerX,
            y: playerY,
            vx: 0,
            vy: 0,
            life: 0.3,
            maxLife: 0.3,
            color: '#ffffff',
            size: 50,
            glow: true,
            isFlash: true
        });
        
        // Check if player died
        setTimeout(() => {
            if (playerHealth <= 0 && currentState === GameState.PLAYING) {
                gameOver();
            }
        }, 100);
    }
}

// Helper function to check if laser beam hits player (rectangle vs line collision)
function checkLaserHitPlayer(x1, y1, x2, y2) {
    if (!player) return false;
    
    // Player rectangle bounds
    const px1 = player.x;
    const py1 = player.y;
    const px2 = player.x + player.width;
    const py2 = player.y + player.height;
    
    // Check if line intersects with player rectangle
    // Use line-rectangle intersection algorithm
    return lineIntersectsRect(x1, y1, x2, y2, px1, py1, px2, py2);
}

function lineIntersectsRect(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
    // Check if either endpoint is inside rectangle
    if ((x1 >= rx1 && x1 <= rx2 && y1 >= ry1 && y1 <= ry2) ||
        (x2 >= rx1 && x2 <= rx2 && y2 >= ry1 && y2 <= ry2)) {
        return true;
    }
    
    // Check if line intersects any of the four rectangle edges
    return (
        lineIntersectsLine(x1, y1, x2, y2, rx1, ry1, rx2, ry1) || // Top edge
        lineIntersectsLine(x1, y1, x2, y2, rx2, ry1, rx2, ry2) || // Right edge
        lineIntersectsLine(x1, y1, x2, y2, rx1, ry2, rx2, ry2) || // Bottom edge
        lineIntersectsLine(x1, y1, x2, y2, rx1, ry1, rx1, ry2)    // Left edge
    );
}

function lineIntersectsLine(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
    if (denom === 0) return false;
    
    const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denom;
    const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denom;
    
    return (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1);
}

// Create laser beam visual effect
function createLaserBeam(x1, y1, x2, y2) {
    if (!laserBeams) window.laserBeams = [];
    
    laserBeams.push({
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        life: 0.6,
        maxLife: 0.6,
        width: 15,
        created: Date.now()
    });
}

function createHomingMissile(x, y) {
    enemies.push({
        x: x,
        y: y,
        width: 20,
        height: 12,
        speed: 180,
        health: 2,
        maxHealth: 2,
        scoreValue: 10,
        vx: -180,
        vy: 0,
        destroyed: false,
        isBossProjectile: true,
        isHoming: true,
        homingStrength: 100
    });
}

function createBossProjectile(x, y, angle, speed, color = '#ff8800', size = 18) {
    // Play boss laser sound for projectile attacks
    Audio.play('bossLaser', 0.6);
    
    enemies.push({
        x: x,
        y: y,
        width: size,
        height: size,
        speed: speed,
        health: 1,
        maxHealth: 1,
        scoreValue: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        destroyed: false,
        isBossProjectile: true,
        color: color
    });
}

function drawBoss() {
    if (!boss || boss.destroyed) return;
    
    ctx.save();
    
    const cx = boss.x + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    
    // Draw fragments (flying debris)
    boss.fragments.forEach(frag => {
        ctx.save();
        ctx.translate(frag.x, frag.y);
        ctx.rotate(frag.rotation);
        ctx.fillStyle = `rgba(120, 80, 40, ${frag.life / 2})`;
        ctx.fillRect(-frag.size/2, -frag.size/2, frag.size, frag.size);
        ctx.strokeStyle = `rgba(80, 50, 20, ${frag.life / 2})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-frag.size/2, -frag.size/2, frag.size, frag.size);
        ctx.restore();
    });
    
    // Apply rotation for visual effect
    ctx.translate(cx, cy);
    ctx.rotate(boss.rotation);
    ctx.translate(-cx, -cy);
    
    // REALISTIC ASTEROID SHAPE - Irregular, rocky polygon
    const baseRadius = boss.width / 2;
    const points = 16; // More points for detail
    const asteroidPoints = [];
    
    // Generate irregular asteroid shape
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Create varied radius with multiple sine waves for natural irregularity
        const variation1 = Math.sin(i * 2.1) * 0.15;
        const variation2 = Math.sin(i * 3.7) * 0.1;
        const variation3 = Math.sin(i * 5.3) * 0.08;
        const radiusMultiplier = 0.75 + variation1 + variation2 + variation3;
        const radius = baseRadius * radiusMultiplier;
        asteroidPoints.push({
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius,
            angle: angle,
            radius: radius
        });
    }
    
    // Draw main asteroid body with gradient
    const bodyGradient = ctx.createRadialGradient(cx - baseRadius * 0.2, cy - baseRadius * 0.2, 0, cx, cy, baseRadius);
    bodyGradient.addColorStop(0, '#9d7555'); // Lighter brown (sunlit side)
    bodyGradient.addColorStop(0.5, '#7a5c3f'); // Medium brown
    bodyGradient.addColorStop(1, '#5a4530'); // Dark brown (shadow side)
    
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    asteroidPoints.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
    ctx.fill();
    
    // Dark outline for definition
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw craters and surface details
    const craterCount = 8;
    for (let i = 0; i < craterCount; i++) {
        const angle = (i / craterCount) * Math.PI * 2 + 0.5;
        const dist = baseRadius * (0.2 + Math.sin(i * 1.7) * 0.25);
        const craterX = cx + Math.cos(angle) * dist;
        const craterY = cy + Math.sin(angle) * dist;
        const craterSize = baseRadius * (0.08 + Math.sin(i * 2.3) * 0.04);
        
        // Crater shadow
        ctx.fillStyle = 'rgba(40, 30, 20, 0.6)';
        ctx.beginPath();
        ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Crater rim highlight
        ctx.strokeStyle = 'rgba(140, 110, 80, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Draw surface cracks
    const crackCount = 12;
    for (let i = 0; i < crackCount; i++) {
        const startAngle = (i / crackCount) * Math.PI * 2;
        const startR = baseRadius * (0.25 + Math.random() * 0.3);
        const endR = baseRadius * (0.5 + Math.random() * 0.3);
        const angleOffset = (Math.random() - 0.5) * 0.4;
        
        ctx.strokeStyle = 'rgba(50, 35, 20, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            cx + Math.cos(startAngle) * startR,
            cy + Math.sin(startAngle) * startR
        );
        
        // Jagged crack line
        const segments = 3;
        for (let j = 1; j <= segments; j++) {
            const t = j / segments;
            const currentR = startR + (endR - startR) * t;
            const currentAngle = startAngle + angleOffset * t + (Math.random() - 0.5) * 0.2;
            ctx.lineTo(
                cx + Math.cos(currentAngle) * currentR,
                cy + Math.sin(currentAngle) * currentR
            );
        }
        ctx.stroke();
    }
    
    // Draw rocky protrusions (bumps)
    const rockCount = 6;
    for (let i = 0; i < rockCount; i++) {
        const angle = (i / rockCount) * Math.PI * 2 + 0.7;
        const dist = baseRadius * 0.85;
        const rockX = cx + Math.cos(angle) * dist;
        const rockY = cy + Math.sin(angle) * dist;
        const rockSize = baseRadius * 0.12;
        
        ctx.fillStyle = '#6d5436';
        ctx.beginPath();
        ctx.arc(rockX, rockY, rockSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Rock highlight
        ctx.fillStyle = 'rgba(150, 120, 90, 0.5)';
        ctx.beginPath();
        ctx.arc(rockX - rockSize * 0.3, rockY - rockSize * 0.3, rockSize * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Boss GLOWING CORE (orange/red magma-like center)
    const pulseScale = 1.0 + Math.sin(Date.now() / 200) * 0.15;
    const coreRadius = boss.width * 0.2 * pulseScale;
    
    // Outer glow layers
    for (let layer = 4; layer >= 0; layer--) {
        const layerRadius = coreRadius * (1 + layer * 0.3);
        const layerAlpha = (1 - layer * 0.2) * 0.7;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerRadius);
        gradient.addColorStop(0, `rgba(255, 255, 200, ${layerAlpha})`);
        gradient.addColorStop(0.4, `rgba(255, 180, 50, ${layerAlpha * 0.8})`);
        gradient.addColorStop(0.7, `rgba(255, 100, 20, ${layerAlpha * 0.5})`);
        gradient.addColorStop(1, `rgba(200, 50, 0, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Bright inner core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Core ring
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
    
    // Draw shield if active (outside rotation)
    if (boss.shielded) {
        const shieldPulse = Math.sin(Date.now() / 100) * 0.1 + 0.9;
        const shieldRadius = boss.width * 0.65 * shieldPulse;
        
        // Shield layers
        for (let layer = 0; layer < 3; layer++) {
            const layerOffset = layer * 5;
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.3 - layer * 0.08})`;
            ctx.lineWidth = 3 - layer;
            ctx.beginPath();
            ctx.arc(cx, cy, shieldRadius + layerOffset, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Shield hexagons
        const hexCount = 8;
        for (let i = 0; i < hexCount; i++) {
            const angle = (i / hexCount) * Math.PI * 2 + Date.now() / 1000;
            const x = cx + Math.cos(angle) * shieldRadius * 0.85;
            const y = cy + Math.sin(angle) * shieldRadius * 0.85;
            
            ctx.strokeStyle = 'rgba(150, 220, 255, 0.5)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const ha = (j / 6) * Math.PI * 2;
                const hx = x + Math.cos(ha) * 10;
                const hy = y + Math.sin(ha) * 10;
                if (j === 0) ctx.moveTo(hx, hy);
                else ctx.lineTo(hx, hy);
            }
            ctx.closePath();
            ctx.stroke();
        }
        
        // "SHIELD ACTIVE" text
        ctx.fillStyle = '#00ddff';
        ctx.font = 'bold 11px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('SHIELD ACTIVE', cx, cy - boss.height / 2 - 35);
    }
    
    // Draw charging effect (ENHANCED)
    if (boss.charging) {
        const chargeSize = boss.width * 0.5 * Math.max(boss.chargeProgress, 0.3);
        const chargePulse = Math.sin(Date.now() / 40) * 0.2 + 0.8;
        
        // Multiple charging layers for intensity
        for (let layer = 0; layer < 5; layer++) {
            const layerSize = chargeSize * (1 + layer * 0.25) * chargePulse;
            const layerAlpha = boss.chargeProgress * (1 - layer * 0.15);
            
            const chargeGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, layerSize);
            chargeGradient.addColorStop(0, `rgba(255, 255, 255, ${layerAlpha * 0.9})`);
            chargeGradient.addColorStop(0.3, `rgba(255, 255, 100, ${layerAlpha * 0.7})`);
            chargeGradient.addColorStop(0.6, `rgba(255, 200, 0, ${layerAlpha * 0.5})`);
            chargeGradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
            
            ctx.fillStyle = chargeGradient;
            ctx.beginPath();
            ctx.arc(cx, cy, layerSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Energy rings expanding outward
        const ringCount = 4;
        for (let i = 0; i < ringCount; i++) {
            const ringProgress = (boss.chargeProgress * 2 + i * 0.25) % 1;
            const ringRadius = chargeSize * (0.5 + ringProgress * 2.5);
            const ringAlpha = (1 - ringProgress) * boss.chargeProgress;
            ctx.strokeStyle = `rgba(255, 255, 0, ${ringAlpha * 0.8})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Lightning bolts around charging area
        if (boss.chargeProgress > 0.5) {
            const boltCount = 6;
            for (let i = 0; i < boltCount; i++) {
                if (Math.random() < 0.3) { // Random flicker
                    const angle = (i / boltCount) * Math.PI * 2 + Date.now() / 100;
                    const startR = chargeSize * 0.8;
                    const endR = chargeSize * 1.4;
                    
                    ctx.strokeStyle = `rgba(255, 255, 200, ${boss.chargeProgress * 0.8})`;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cx + Math.cos(angle) * startR, cy + Math.sin(angle) * startR);
                    ctx.lineTo(cx + Math.cos(angle) * endR, cy + Math.sin(angle) * endR);
                    ctx.stroke();
                }
            }
        }
        
        // Charge percentage display (enhanced)
        const chargePercent = Math.floor(boss.chargeProgress * 100);
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffff00';
        ctx.fillStyle = chargePercent >= 90 ? '#ff0000' : '#ffff00';
        ctx.font = 'bold 18px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText(`${chargePercent}%`, cx, cy + boss.height / 2 + 30);
        ctx.restore();
        
        ctx.fillStyle = chargePercent >= 90 ? '#ff6600' : '#ffaa00';
        ctx.font = 'bold 12px "Courier New"';
        ctx.fillText('⚡ CHARGING LASER ⚡', cx, cy + boss.height / 2 + 48);
        
        // WARNING at high charge
        if (chargePercent >= 75) {
            ctx.fillStyle = `rgba(255, 0, 0, ${Math.sin(Date.now() / 100) * 0.5 + 0.5})`;
            ctx.font = 'bold 14px "Courier New"';
            ctx.fillText('⚠ WARNING ⚠', cx, cy - boss.height / 2 - 45);
        }
    }
    
    // Boss name and title (outside rotation)
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 16px "Courier New"';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    ctx.fillText(boss.name, cx, boss.y - 25);
    ctx.shadowBlur = 0;
    
    // State indicator
    if (boss.state !== 'idle' && !boss.charging) {
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 10px "Courier New"';
        const stateText = boss.state.toUpperCase().replace(/_/g, ' ');
        ctx.fillText(stateText, cx, boss.y - 10);
    }
    
    ctx.restore();
}

function damageBoss(damage) {
    if (!boss || boss.destroyed) return;
    
    boss.health -= damage;
    updateHUD();
    
    if (boss.health <= 0) {
        destroyBoss();
    }
}

function destroyBoss() {
    if (!boss || boss.destroyed) return;
    
    boss.destroyed = true;
    score += boss.scoreValue;
    targetsDestroyed++;
    bossesDefeated++;
    
    createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 50, '#ff6600');
    createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, 30, '#ffaa00');
    Audio.play('explosionBig', 1.0);
    
    document.getElementById('bossHealthContainer').style.display = 'none';
    
    // Increase difficulty for next wave
    gameDifficultyMultiplier += 0.3; // +30% difficulty per boss
    
    // Show victory message
    showBossVictoryMessage();
    
    // Complete level after short delay
    setTimeout(() => {
        if (currentGameMode === GameMode.ADVENTURE && currentLevel) {
            completeAdventureLevel();
        } else if (currentGameMode === GameMode.QUICK_PLAY) {
            // Continue the game with increased difficulty
            bossSpawned = false; // Allow another boss to spawn
            boss = null;
            // Game continues!
        } else {
            endGame(true);
        }
    }, 3000);
}

function showBossVictoryMessage() {
    // Create temporary victory message
    const victoryDiv = document.createElement('div');
    victoryDiv.style.position = 'fixed';
    victoryDiv.style.top = '50%';
    victoryDiv.style.left = '50%';
    victoryDiv.style.transform = 'translate(-50%, -50%)';
    victoryDiv.style.fontSize = '48px';
    victoryDiv.style.fontWeight = 'bold';
    victoryDiv.style.color = '#00ff00';
    victoryDiv.style.textShadow = '0 0 20px #00ff00, 0 0 40px #00ff00';
    victoryDiv.style.zIndex = '10000';
    victoryDiv.style.fontFamily = 'Courier New';
    victoryDiv.textContent = 'BOSS DEFEATED!';
    document.body.appendChild(victoryDiv);
    
    const multiplierDiv = document.createElement('div');
    multiplierDiv.style.position = 'fixed';
    multiplierDiv.style.top = '60%';
    multiplierDiv.style.left = '50%';
    multiplierDiv.style.transform = 'translate(-50%, -50%)';
    multiplierDiv.style.fontSize = '24px';
    multiplierDiv.style.color = '#ffaa00';
    multiplierDiv.style.textShadow = '0 0 10px #ffaa00';
    multiplierDiv.style.zIndex = '10000';
    multiplierDiv.style.fontFamily = 'Courier New';
    multiplierDiv.textContent = `Difficulty: ${Math.floor(gameDifficultyMultiplier * 100)}%`;
    document.body.appendChild(multiplierDiv);
    
    setTimeout(() => {
        document.body.removeChild(victoryDiv);
        document.body.removeChild(multiplierDiv);
    }, 2500);
}

// ========================================
// ASTEROIDS
// ========================================

function spawnAsteroid() {
    // Calculate safe spawn area (below HUD + buffer, above bottom)
    const barrierY = Math.max(170, gameplayTopBoundary + 50);
    const safeHeight = canvas.height - barrierY - CONFIG.asteroid.height;
    const y = barrierY + (Math.random() * safeHeight);
    const difficulty = currentLevel ? currentLevel.asteroidConfig : CONFIG.asteroid;
    const baseSpeed = (difficulty.baseSpeed || CONFIG.asteroid.baseSpeed) * gameDifficultyMultiplier;
    
    // Add speed variation: ±50% for more dynamic gameplay
    const speedVariation = 0.5 + Math.random(); // 0.5 to 1.5 multiplier
    
    asteroids.push({
        x: canvas.width,
        y: y,
        width: CONFIG.asteroid.width,
        height: CONFIG.asteroid.height,
        speed: baseSpeed * speedVariation, // Varied speed
        damage: difficulty.baseDamage || CONFIG.asteroid.baseDamage,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 3 // Faster rotation too!
    });
}

function updateAsteroids(deltaTime) {
    const spawnRate = currentLevel ? currentLevel.asteroidConfig.spawnRate : CONFIG.asteroid.baseSpawnRate;
    
    asteroidSpawnTimer += deltaTime;
    if (asteroidSpawnTimer >= spawnRate) {
        spawnAsteroid();
        asteroidSpawnTimer = 0;
    }
    
    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];
        asteroid.x -= asteroid.speed * deltaTime;
        asteroid.rotation += asteroid.rotationSpeed * deltaTime;
        
        // Remove if off left edge
        if (asteroid.x + asteroid.width < 0) {
            asteroids.splice(i, 1);
            continue;
        }
        
        // Collision with HUD boundary - destroy asteroid if it enters HUD area
        if (asteroid.y < gameplayTopBoundary) {
            console.log('Asteroid hit barrier!', { asteroidY: asteroid.y, boundary: gameplayTopBoundary });
            asteroids.splice(i, 1);
            createParticles(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, 8, '#8888ff');
        }
    }
}

function drawAsteroids() {
    asteroids.forEach(asteroid => {
        ctx.save();
        ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
        ctx.rotate(asteroid.rotation);
        
        // Enhanced asteroid with gradient and glow
        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(150, 150, 180, 0.5)';
        
        // Create gradient for depth
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, asteroid.width / 2);
        gradient.addColorStop(0, '#aaaacc');
        gradient.addColorStop(0.5, '#888899');
        gradient.addColorStop(1, '#555566');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#666677';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        const points = 8;
        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const radius = (asteroid.width / 2) * (0.7 + Math.sin(i * 2.5) * 0.3);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowBlur = 0;
        
        // Add glowing craters
        ctx.fillStyle = '#667788';
        ctx.beginPath();
        ctx.arc(-8, -6, 6, 0, Math.PI * 2);
        ctx.arc(6, 4, 4, 0, Math.PI * 2);
        ctx.arc(-3, 8, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright mineral spots (glowing blue crystals)
        ctx.fillStyle = 'rgba(0, 191, 255, 0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 191, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(5, -6, 2, 0, Math.PI * 2);
        ctx.arc(-7, 5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

// ========================================
// POWERUPS / SUPPLY DROPS
// ========================================

const PowerupType = {
    HEALTH: 'health',
    SHIELD: 'shield',
    MISSILES: 'missiles'
};

function spawnPowerup(x, y, type = null) {
    // Random type if not specified
    if (!type) {
        const types = [PowerupType.HEALTH, PowerupType.SHIELD, PowerupType.MISSILES];
        type = types[Math.floor(Math.random() * types.length)];
    }
    
    const powerupConfig = {
        [PowerupType.HEALTH]: { color: '#00ff00', icon: '+', value: 30, label: 'HEALTH' },
        [PowerupType.SHIELD]: { color: '#00aaff', icon: '◆', value: 50, label: 'SHIELD' },
        [PowerupType.MISSILES]: { color: '#ff6600', icon: '🚀', value: 3, label: 'MISSILES' }
    };
    
    const config = powerupConfig[type];
    
    powerups.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        type: type,
        color: config.color,
        icon: config.icon,
        value: config.value,
        label: config.label,
        rotation: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        lifespan: 15, // 15 seconds before disappearing
        collected: false
    });
}

function updatePowerups(deltaTime) {
    for (let i = powerups.length - 1; i >= 0; i--) {
        const powerup = powerups[i];
        
        // Slow drift left
        powerup.x -= 50 * deltaTime;
        
        // Rotate and pulse
        powerup.rotation += deltaTime * 2;
        powerup.pulsePhase += deltaTime * 3;
        
        // Decrease lifespan
        powerup.lifespan -= deltaTime;
        
        // Remove if off screen or expired
        if (powerup.x + powerup.width < 0 || powerup.lifespan <= 0) {
            powerups.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (player && !powerup.collected && checkCollision(powerup, player)) {
            collectPowerup(powerup);
            powerups.splice(i, 1);
        }
    }
}

function collectPowerup(powerup) {
    powerup.collected = true;
    
    // Apply powerup effect
    switch (powerup.type) {
        case PowerupType.HEALTH:
            player.health = Math.min(player.health + powerup.value, player.fighterConfig.stats.maxHealth);
            playerHealth = player.health; // Sync both health variables
            showPowerupMessage(`+${powerup.value} HEALTH`, powerup.color);
            break;
            
        case PowerupType.SHIELD:
            // Activate shield for 10 seconds (invulnerability)
            shieldActive = true;
            shieldDuration = shieldMaxDuration;
            showPowerupMessage(`SHIELD ACTIVATED!`, powerup.color);
            Audio.play('powerup', 0.8);
            break;
            
        case PowerupType.MISSILES:
            missileCount += powerup.value;
            showPowerupMessage(`+${powerup.value} MISSILES`, powerup.color);
            break;
    }
    
    updateHUD();
    
    // Create collection particles
    createParticles(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, 15, powerup.color);
}

function showPowerupMessage(text, color) {
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '35%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.fontSize = '32px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.color = color;
    messageDiv.style.textShadow = `0 0 15px ${color}`;
    messageDiv.style.zIndex = '10000';
    messageDiv.style.fontFamily = 'Courier New';
    messageDiv.style.animation = 'fadeUp 1.5s ease-out';
    messageDiv.textContent = text;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            document.body.removeChild(messageDiv);
        }
    }, 1500);
}

function drawPowerups() {
    powerups.forEach(powerup => {
        ctx.save();
        
        const cx = powerup.x + powerup.width / 2;
        const cy = powerup.y + powerup.height / 2;
        const pulse = 1 + Math.sin(powerup.pulsePhase) * 0.2;
        const size = powerup.width * pulse;
        
        // Warning blink if expiring
        if (powerup.lifespan < 3 && Math.floor(powerup.lifespan * 4) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Rotate
        ctx.translate(cx, cy);
        ctx.rotate(powerup.rotation);
        ctx.translate(-cx, -cy);
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size);
        glowGradient.addColorStop(0, powerup.color + '88');
        glowGradient.addColorStop(0.5, powerup.color + '44');
        glowGradient.addColorStop(1, powerup.color + '00');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(cx, cy, size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Box/container
        ctx.fillStyle = '#333';
        ctx.strokeStyle = powerup.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerup.color;
        
        ctx.fillRect(cx - size / 2, cy - size / 2, size, size);
        ctx.strokeRect(cx - size / 2, cy - size / 2, size, size);
        
        ctx.shadowBlur = 0;
        
        // Icon
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${size * 0.6}px "Courier New"`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(powerup.icon, cx, cy);
        
        ctx.restore();
        
        // Label (not rotated)
        if (powerup.lifespan > 3 || Math.floor(powerup.lifespan * 4) % 2 === 1) {
            ctx.fillStyle = powerup.color;
            ctx.font = 'bold 10px "Courier New"';
            ctx.textAlign = 'center';
            ctx.fillText(powerup.label, cx, cy + size);
        }
    });
    
    ctx.globalAlpha = 1;
}

// Randomly spawn powerups from destroyed enemies (10% chance)
function trySpawnPowerupFromEnemy(enemy) {
    if (Math.random() < 0.10) { // 10% chance
        spawnPowerup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    }
}

// ========================================
// PARTICLES
// ========================================

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 150;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0.5 + Math.random() * 0.8,
            maxLife: 1,
            color: color,
            size: 3 + Math.random() * 5,
            glow: true
        });
    }
}

// Alias for createParticles
function createExplosion(x, y, count, color) {
    createParticles(x, y, count, color);
}

// Screen shake effect
let shakeAmount = 0;
let shakeDecay = 0;

function screenShake(intensity) {
    shakeAmount = intensity;
    shakeDecay = 0.9;
}

function applyScreenShake() {
    if (shakeAmount > 0.1) {
        const shakeX = (Math.random() - 0.5) * shakeAmount;
        const shakeY = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(shakeX, shakeY);
        shakeAmount *= shakeDecay;
    } else {
        shakeAmount = 0;
    }
}

function updateParticles(deltaTime) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.life -= deltaTime;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateLaserBeams(deltaTime) {
    for (let i = laserBeams.length - 1; i >= 0; i--) {
        const beam = laserBeams[i];
        beam.life -= deltaTime;
        
        if (beam.life <= 0) {
            laserBeams.splice(i, 1);
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        const alpha = p.life / p.maxLife;
        
        // Flash particles (impact flash)
        if (p.isFlash) {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 - alpha * 0.5), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            return;
        }
        
        // Add glow effect to particles
        if (p.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
        }
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        
        // Draw as circle for smoother look
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add bright core
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
}

function drawLaserBeams() {
    laserBeams.forEach(beam => {
        const alpha = beam.life / beam.maxLife;
        const age = Date.now() - beam.created;
        
        ctx.save();
        
        // Calculate beam angle
        const dx = beam.x2 - beam.x1;
        const dy = beam.y2 - beam.y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Outer glow (widest)
        const outerGradient = ctx.createLinearGradient(
            beam.x1, beam.y1,
            beam.x2, beam.y2
        );
        outerGradient.addColorStop(0, `rgba(255, 200, 0, ${alpha * 0.3})`);
        outerGradient.addColorStop(0.5, `rgba(255, 255, 100, ${alpha * 0.4})`);
        outerGradient.addColorStop(1, `rgba(255, 200, 0, ${alpha * 0.3})`);
        
        ctx.strokeStyle = outerGradient;
        ctx.lineWidth = beam.width * 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
        
        // Middle layer
        const middleGradient = ctx.createLinearGradient(
            beam.x1, beam.y1,
            beam.x2, beam.y2
        );
        middleGradient.addColorStop(0, `rgba(255, 255, 0, ${alpha * 0.6})`);
        middleGradient.addColorStop(0.5, `rgba(255, 255, 200, ${alpha * 0.8})`);
        middleGradient.addColorStop(1, `rgba(255, 255, 0, ${alpha * 0.6})`);
        
        ctx.strokeStyle = middleGradient;
        ctx.lineWidth = beam.width * 1.5;
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
        
        // Core beam (brightest)
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = beam.width * 0.5;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(beam.x1, beam.y1);
        ctx.lineTo(beam.x2, beam.y2);
        ctx.stroke();
        ctx.shadowBlur = 0;
        
        // Energy crackling along beam (random segments)
        if (age < 300) { // Only in first 300ms
            const segmentCount = 8;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < segmentCount; i++) {
                if (Math.random() < 0.5) {
                    const t1 = i / segmentCount;
                    const t2 = (i + 0.3) / segmentCount;
                    const x1 = beam.x1 + dx * t1;
                    const y1 = beam.y1 + dy * t1;
                    const x2 = beam.x1 + dx * t2;
                    const y2 = beam.y1 + dy * t2;
                    
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }
        
        // Muzzle flash at origin
        if (age < 200) {
            const flashSize = beam.width * 2 * (1 - age / 200);
            const flashGradient = ctx.createRadialGradient(
                beam.x1, beam.y1, 0,
                beam.x1, beam.y1, flashSize
            );
            flashGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            flashGradient.addColorStop(0.5, `rgba(255, 255, 100, ${alpha * 0.6})`);
            flashGradient.addColorStop(1, 'rgba(255, 200, 0, 0)');
            
            ctx.fillStyle = flashGradient;
            ctx.beginPath();
            ctx.arc(beam.x1, beam.y1, flashSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Impact flash at target
        if (age < 200) {
            const impactSize = beam.width * 3 * (1 - age / 200);
            const impactGradient = ctx.createRadialGradient(
                beam.x2, beam.y2, 0,
                beam.x2, beam.y2, impactSize
            );
            impactGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            impactGradient.addColorStop(0.4, `rgba(255, 255, 100, ${alpha * 0.8})`);
            impactGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = impactGradient;
            ctx.beginPath();
            ctx.arc(beam.x2, beam.y2, impactSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

// ========================================
// COLLISION DETECTION
// ========================================

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function handleCollisions() {
    // Projectiles vs Enemies
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        let hit = false;
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (enemy.destroyed) continue;
            if (checkCollision(proj, enemy)) {
                damageEnemy(enemy, proj.damage);
                projectiles.splice(i, 1);
                hit = true;
                break;
            }
        }
        
        if (hit) continue;
        
        // vs UFOs
        for (let j = ufos.length - 1; j >= 0; j--) {
            const ufo = ufos[j];
            if (ufo.destroyed) continue;
            if (checkCollision(proj, ufo)) {
                damageUFO(ufo, proj.damage);
                projectiles.splice(i, 1);
                hit = true;
                break;
            }
        }
        
        if (hit) continue;
        
        // vs Boss
        if (boss && !boss.destroyed && checkCollision(proj, boss)) {
            damageBoss(proj.damage);
            projectiles.splice(i, 1);
            continue;
        }
        
        // vs Asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
            const asteroid = asteroids[j];
            if (checkCollision(proj, asteroid)) {
                projectiles.splice(i, 1);
                createParticles(proj.x, proj.y, 3, '#ffff00');
                break;
            }
        }
    }
    
    // Missiles vs Enemies, UFOs, and Boss
    for (let i = missiles.length - 1; i >= 0; i--) {
        const missile = missiles[i];
        let hit = false;
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (enemy.destroyed) continue;
            if (checkCollision(missile, enemy)) {
                damageEnemy(enemy, missile.damage);
                missiles.splice(i, 1);
                createParticles(missile.x, missile.y, 10, '#ff6600');
                hit = true;
                break;
            }
        }
        
        if (hit) continue;
        
        for (let j = ufos.length - 1; j >= 0; j--) {
            const ufo = ufos[j];
            if (ufo.destroyed) continue;
            if (checkCollision(missile, ufo)) {
                damageUFO(ufo, missile.damage);
                missiles.splice(i, 1);
                createParticles(missile.x, missile.y, 10, '#ff6600');
                hit = true;
                break;
            }
        }
        
        if (hit) continue;
        
        if (boss && !boss.destroyed && checkCollision(missile, boss)) {
            damageBoss(missile.damage);
            missiles.splice(i, 1);
            createParticles(missile.x, missile.y, 10, '#ff6600');
        }
    }
    
    // Player vs Enemies and UFOs
    if (player) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (enemy.destroyed) continue;
            if (checkCollision(player, enemy)) {
                damagePlayer(enemy.isBossProjectile ? 10 : CONFIG.asteroid.baseDamage);
                enemies.splice(i, 1);
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, '#ff0000');
            }
        }
        
        for (let i = ufos.length - 1; i >= 0; i--) {
            const ufo = ufos[i];
            if (ufo.destroyed) continue;
            if (checkCollision(player, ufo)) {
                damagePlayer(15); // UFO collision damage
                ufos.splice(i, 1);
                createParticles(ufo.x + ufo.width / 2, ufo.y + ufo.height / 2, 15, '#00ffaa');
            }
        }
        
        // Player vs Asteroids
        for (let i = asteroids.length - 1; i >= 0; i--) {
            const asteroid = asteroids[i];
            if (checkCollision(player, asteroid)) {
                damagePlayer(asteroid.damage);
                asteroids.splice(i, 1);
                createParticles(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2, 10, '#888');
            }
        }
        
        // Player vs Boss
        if (boss && !boss.destroyed && checkCollision(player, boss)) {
            damagePlayer(30);
        }
    }
}

// Continued...

// ========================================
// HUD
// ========================================

function updateHUD() {
    if (!player) return;
    
    // Format and display timer (MM:SS)
    const minutes = Math.floor(playTime / 60);
    const seconds = playTime % 60;
    document.getElementById('timerDisplay').textContent = 
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    
    // Health
    document.getElementById('healthText').textContent = Math.max(0, Math.floor(player.health));
    const healthPercent = Math.max(0, (player.health / player.maxHealth) * 100);
    document.getElementById('healthFill').style.width = healthPercent + '%';
    
    // Update health value color based on percentage
    const healthValueEl = document.getElementById('healthText');
    if (healthPercent > 60) {
        healthValueEl.style.color = '#00ff00';
        healthValueEl.style.textShadow = '0 0 8px rgba(0, 255, 0, 0.6)';
    } else if (healthPercent > 30) {
        healthValueEl.style.color = '#ffaa00';
        healthValueEl.style.textShadow = '0 0 8px rgba(255, 170, 0, 0.6)';
    } else {
        healthValueEl.style.color = '#ff1744';
        healthValueEl.style.textShadow = '0 0 8px rgba(255, 23, 68, 0.6)';
    }
    
    // Targets and Score
    document.getElementById('targetsCount').textContent = targetsDestroyed;
    document.getElementById('scoreCount').textContent = score;
    
    // Missiles
    document.getElementById('missileCount').textContent = missileCount;
    
    // Fighter name
    if (currentProfile && currentProfile.selectedFighter) {
        const fighter = FIGHTERS[currentProfile.selectedFighter];
        document.getElementById('fighterName').textContent = fighter ? fighter.name : 'UNKNOWN';
    }
    
    // Ability status
    const abilityStatusEl = document.getElementById('abilityStatus');
    const abilityCooldownBar = document.getElementById('abilityCooldownBar');
    const abilityCooldownFill = document.getElementById('abilityCooldownFill');
    
    if (!abilityReady) {
        abilityStatusEl.textContent = Math.ceil(abilityCooldownTimer) + 's';
        abilityStatusEl.className = 'hud-value ability-value cooldown';
        
        // Show cooldown bar
        abilityCooldownBar.classList.add('active');
        const selectedFighter = FIGHTERS[currentProfile.selectedFighter];
        const cooldownPercent = ((selectedFighter.ability.cooldown - abilityCooldownTimer) / selectedFighter.ability.cooldown) * 100;
        abilityCooldownFill.style.width = Math.max(0, Math.min(100, cooldownPercent)) + '%';
    } else if (abilityActive) {
        abilityStatusEl.textContent = 'ACTIVE';
        abilityStatusEl.className = 'hud-value ability-value active';
        abilityCooldownBar.classList.remove('active');
    } else {
        abilityStatusEl.textContent = 'READY';
        abilityStatusEl.className = 'hud-value ability-value ready';
        abilityCooldownBar.classList.remove('active');
    }
    
    // Boss health and name
    if (boss && !boss.destroyed) {
        const bossHealthPercent = Math.max(0, (boss.health / boss.maxHealth) * 100);
        document.getElementById('bossHealthFill').style.width = bossHealthPercent + '%';
        document.getElementById('bossName').textContent = boss.name || 'BOSS';
        document.getElementById('bossHealthContainer').style.display = 'flex';
    } else {
        document.getElementById('bossHealthContainer').style.display = 'none';
    }
}

// ========================================
// GAME LOOP
// ========================================

function update(currentTime) {
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap delta
    lastTime = currentTime;
    
    // Update play time ALWAYS (real time, not game time) - counts even when paused
    playTime = Math.floor((Date.now() - gameStartTime) / 1000);
    
    if (currentState === GameState.PLAYING) {
        updatePlayer(deltaTime);
        updateProjectiles(deltaTime);
        updateMissiles(deltaTime);
        updateEnemies(deltaTime);
        updateUFOs(deltaTime);
        updateAsteroids(deltaTime);
        updateBoss(deltaTime);
        updatePowerups(deltaTime);
        updateParticles(deltaTime);
        updateLaserBeams(deltaTime);
        handleCollisions();
        
        // Update shield timer
        if (shieldActive) {
            shieldDuration -= deltaTime;
            if (shieldDuration <= 0) {
                shieldActive = false;
                shieldDuration = 0;
                console.log('Shield deactivated');
            }
        }
    }
    
    render();
    requestAnimationFrame(update);
}

function render() {
    ctx.save(); // Save state for screen shake
    
    // Apply screen shake effect
    applyScreenShake();
    
    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw starfield
    drawStarfield();
    
    if (currentState === GameState.PLAYING || currentState === GameState.PAUSED) {
        // Barrier line removed - invisible now
        
        drawPlayer();
        drawProjectiles();
        drawMissiles();
        drawEnemies();
        drawUFOs();
        drawAsteroids();
        drawBoss();
        drawPowerups();
        drawLaserBeams();
        drawParticles();
    }
    
    ctx.restore(); // Restore state after screen shake
}

// ========================================
// STARFIELD
// ========================================

let stars = [];

function initStarfield() {
    stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 20 + Math.random() * 50,
            size: 1 + Math.random() * 2
        });
    }
}

function drawStarfield() {
    if (stars.length === 0) initStarfield();
    
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        ctx.globalAlpha = 0.3 + Math.random() * 0.4;
        ctx.fillRect(star.x, star.y, star.size, star.size);
        
        if (currentState === GameState.PLAYING) {
            star.x -= star.speed * 0.016;
            if (star.x < 0) {
                star.x = canvas.width;
                star.y = Math.random() * canvas.height;
            }
        }
    });
    ctx.globalAlpha = 1;
}

// ========================================
// GAME STATE MANAGEMENT
// ========================================

function startGame(mode, level = null, botDifficulty = null) {
    currentGameMode = mode;
    currentLevel = level;
    
    // Start battle music
    Audio.stopMusic();
    Audio.startGameMusic();
    
    // Recalculate HUD boundary before creating game objects
    calculateHUDBoundary();
    
    // Reset game variables
    const selectedFighter = FIGHTERS[currentProfile.selectedFighter];
    player = createPlayer(selectedFighter);
    playerHealth = player.health; // Initialize player health from fighter stats
    projectiles = [];
    missiles = [];
    enemies = [];
    ufos = [];
    asteroids = [];
    particles = [];
    boss = null;
    bossSpawned = false; // Track if boss has been spawned in Quick Play
    score = 0;
    targetsDestroyed = 0;
    coinsEarned = 0;
    xpEarned = 0;
    enemySpawnTimer = 0;
    ufoSpawnTimer = 0;
    asteroidSpawnTimer = 0;
    
    // Initialize timer (real time - continues even when paused)
    playTime = 0;
    gameStartTime = Date.now();
    
    // Reset player state
    missileCount = selectedFighter.stats.missileCount;
    abilityReady = true;
    abilityCooldownTimer = 0;
    abilityActive = false;
    abilityDuration = 0;
    
    // Adventure mode: spawn boss if boss level
    if (mode === GameMode.ADVENTURE && level && level.isBoss) {
        setTimeout(() => {
            spawnBoss(level.boss);
        }, 2000);
    }
    
    // Arena mode: create bot and spawn boss after 30 kills
    if (mode === GameMode.ARENA) {
        createArenaBot(botDifficulty);
        
        // Spawn arena boss after 30 targets destroyed
        const originalTargetsCheck = setInterval(() => {
            if (currentGameMode === GameMode.ARENA && targetsDestroyed >= 30 && !bossSpawned) {
                bossSpawned = true;
                clearInterval(originalTargetsCheck);
                setTimeout(() => {
                    spawnBoss('ARENA_CHAMPION');
                }, 2000);
            }
            if (currentGameMode !== GameMode.ARENA) {
                clearInterval(originalTargetsCheck);
            }
        }, 1000);
    }
    
    updateHUD();
    showScreen('gameScreen');
    currentState = GameState.PLAYING;
}

function createArenaBot(difficulty) {
    // Simple bot fighter that moves and shoots
    const botFighters = ['THUNDER', 'PHANTOM', 'VIPER'];
    const botFighter = FIGHTERS[botFighters[Math.floor(Math.random() * botFighters.length)]];
    
    const difficultyMultipliers = {
        easy: { health: 0.7, damage: 0.7, speed: 0.8 },
        medium: { health: 1.0, damage: 1.0, speed: 1.0 },
        hard: { health: 1.5, damage: 1.5, speed: 1.2 }
    };
    
    const mult = difficultyMultipliers[difficulty] || difficultyMultipliers.medium;
    
    // Calculate safe starting position (below HUD)
    const safeHeight = canvas.height - gameplayTopBoundary;
    const startY = gameplayTopBoundary + (safeHeight / 2);
    
    arenaBot = {
        name: botFighter.name,
        x: canvas.width - 200,
        y: startY,
        width: CONFIG.player.width,
        height: CONFIG.player.height,
        health: botFighter.stats.maxHealth * mult.health,
        maxHealth: botFighter.stats.maxHealth * mult.health,
        speed: botFighter.stats.speed * mult.speed,
        shootCooldown: botFighter.stats.shootCooldown / mult.damage,
        shootTimer: 0,
        damage: botFighter.stats.projectileDamage * mult.damage,
        color: botFighter.color,
        moveTimer: 0,
        targetY: startY
    };
}

function pauseGame() {
    if (currentState !== GameState.PLAYING) return;
    currentState = GameState.PAUSED;
    showScreen('pauseScreen');
}

function resumeGame() {
    if (currentState !== GameState.PAUSED) return;
    currentState = GameState.PLAYING;
    showScreen('gameScreen');
}

function gameOver() {
    currentState = GameState.GAME_OVER;
    
    // Calculate coins earned: 1 coin per target
    const coinsEarned = targetsDestroyed;
    const xpEarned = Math.floor(targetsDestroyed * 5);
    
    // Add coins and XP immediately
    currentProfile.coins += coinsEarned;
    currentProfile.xp += xpEarned;
    
    // Update stats
    currentProfile.totalKills = (currentProfile.totalKills || 0) + targetsDestroyed;
    currentProfile.bestScore = Math.max(currentProfile.bestScore || 0, score);
    currentProfile.gamesPlayed = (currentProfile.gamesPlayed || 0) + 1;
    
    // Check level up
    while (currentProfile.xp >= currentProfile.xpToNextLevel) {
        currentProfile.xp -= currentProfile.xpToNextLevel;
        currentProfile.level++;
        currentProfile.xpToNextLevel = Math.floor(100 * Math.pow(1.15, currentProfile.level - 1));
    }
    
    // Save profile with detailed logging
    console.log('=== SAVING PROFILE ===');
    console.log('Username:', currentProfile.username);
    console.log('Coins:', currentProfile.coins);
    console.log('Level:', currentProfile.level);
    console.log('XP:', currentProfile.xp);
    
    const saveSuccess = StorageManager.saveProfile(currentProfile);
    console.log('Save successful:', saveSuccess);
    
    console.log('=== GAME OVER ===');
    console.log('Targets destroyed:', targetsDestroyed);
    console.log('Coins earned:', coinsEarned);
    console.log('New coin total:', currentProfile.coins);
    
    // Save to leaderboard with play duration
    const entry = {
        username: currentProfile.username,
        fighter: currentProfile.selectedFighter,
        targetsDestroyed: targetsDestroyed,
        score: score,
        playTime: playTime // Save play duration in seconds
    };
    StorageManager.addLeaderboardEntry(entry);
    
    // Submit to backend
    submitGameResult({
        gameMode: 'quick_play',
        fighterUsed: currentProfile.selectedFighter,
        targetsDestroyed: targetsDestroyed,
        score: score,
        playTime: playTime,
        completed: false
    });
    
    document.getElementById('finalTargets').textContent = targetsDestroyed;
    document.getElementById('finalScore').textContent = score;
    
    showScreen('gameOverScreen');
}

function endGame(success) {
    currentState = GameState.RESULTS;
    
    // Calculate rewards
    if (currentGameMode === GameMode.ADVENTURE && currentLevel) {
        coinsEarned = targetsDestroyed; // 1 coin per target
        xpEarned = Math.floor(currentLevel.rewards.xp);
    } else if (currentGameMode === GameMode.ARENA) {
        coinsEarned = success ? 150 : 50;
        xpEarned = success ? 100 : 30;
    } else {
        // Quick Play: 1 coin per target destroyed
        coinsEarned = targetsDestroyed;
        xpEarned = Math.floor(targetsDestroyed * 5);
    }
    
    // Update stats
    currentProfile.totalKills = (currentProfile.totalKills || 0) + targetsDestroyed;
    currentProfile.bestScore = Math.max(currentProfile.bestScore || 0, score);
    currentProfile.gamesPlayed = (currentProfile.gamesPlayed || 0) + 1;
    if (success) {
        currentProfile.wins = (currentProfile.wins || 0) + 1;
    }
    
    // Save to leaderboard with play duration
    const entry = {
        username: currentProfile.username,
        fighter: currentProfile.selectedFighter,
        targetsDestroyed: targetsDestroyed,
        score: score,
        playTime: playTime // Save play duration in seconds
    };
    StorageManager.addLeaderboardEntry(entry);
    
    // Determine game mode for backend
    let gameMode = 'quick_play';
    if (currentGameMode === GameMode.ADVENTURE) {
        gameMode = 'adventure';
    } else if (currentGameMode === GameMode.ARENA) {
        gameMode = 'bot_arena';
    }
    
    // Submit to backend
    submitGameResult({
        gameMode: gameMode,
        fighterUsed: currentProfile.selectedFighter,
        targetsDestroyed: targetsDestroyed,
        score: score,
        playTime: playTime,
        chapter: currentLevel ? currentLevel.chapter : null,
        level: currentLevel ? currentLevel.level : null,
        completed: success
    });
    
    document.getElementById('resultTargets').textContent = targetsDestroyed;
    document.getElementById('resultScore').textContent = score;
    document.getElementById('resultCoins').textContent = coinsEarned;
    document.getElementById('resultXP').textContent = xpEarned;
    
    showScreen('resultsScreen');
}

function completeAdventureLevel() {
    // Apply rewards
    const result = completeLevel(currentLevel.id, 
        { score, targetsDestroyed }, 
        currentProfile, 
        currentProgress);
    
    // Save progress
    StorageManager.saveProfile(currentProfile);
    StorageManager.saveProgress(currentProgress, currentProfile.username);
    
    endGame(true);
}

function returnToMenu() {
    currentState = GameState.MENU;
    
    // Update menu display with current coins/level
    console.log('Returning to menu with coins:', currentProfile.coins);
    const coinsElement = document.getElementById('profileCoins');
    const levelElement = document.getElementById('profileLevel');
    
    if (coinsElement) {
        coinsElement.textContent = currentProfile.coins;
    }
    if (levelElement) {
        levelElement.textContent = currentProfile.level;
    }
    
    showMainMenu();
}

function showScreen(screenId) {
    // Stop menu background animation when leaving main menu (with safety check)
    if (screenId !== 'mainMenu' && typeof stopMenuBackground === 'function') {
        stopMenuBackground();
    }
    
    // Special handling for pause screen - keep game screen visible underneath
    if (screenId === 'pauseScreen') {
        document.querySelectorAll('.screen').forEach(screen => {
            if (screen.id !== 'gameScreen' && screen.id !== 'pauseScreen') {
                screen.classList.add('hidden');
            }
        });
        document.getElementById('pauseScreen').classList.remove('hidden');
    } else {
        // Normal screen switching
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }
}

// ========================================
// MAIN MENU
// ========================================

function showMainMenu() {
    // Use the logged-in username or fallback to profile username
    const displayName = localStorage.getItem('loggedInUser') || currentProfile.username || currentPlayer;
    
    console.log('=== SHOWING MAIN MENU ===');
    console.log('Display name:', displayName);
    console.log('currentProfile:', currentProfile);
    console.log('Coins to display:', currentProfile.coins);
    console.log('Level to display:', currentProfile.level);
    
    // Generate and display avatar
    if (typeof AvatarGenerator !== 'undefined') {
        AvatarGenerator.applyToElement('profileAvatar', displayName, 120);
    }
    
    document.getElementById('welcomeText').textContent = displayName.toUpperCase();
    document.getElementById('profileLevel').textContent = currentProfile.level;
    document.getElementById('profileCoins').textContent = currentProfile.coins;
    
    // Initialize stats if they don't exist
    if (currentProfile.wins === undefined) currentProfile.wins = 0;
    if (currentProfile.totalKills === undefined) currentProfile.totalKills = 0;
    if (currentProfile.bestScore === undefined) currentProfile.bestScore = 0;
    
    // Update stats displays (with safety checks)
    const winsElement = document.getElementById('profileWins');
    if (winsElement) winsElement.textContent = currentProfile.wins;
    
    const totalKillsElement = document.getElementById('totalKills');
    if (totalKillsElement) totalKillsElement.textContent = currentProfile.totalKills;
    
    const bestScoreElement = document.getElementById('bestScore');
    if (bestScoreElement) bestScoreElement.textContent = currentProfile.bestScore;
    
    // Update XP progress bar (with safety checks)
    const xpProgress = (currentProfile.xp / currentProfile.xpToNextLevel) * 100;
    const xpFillElement = document.getElementById('xpFill');
    if (xpFillElement) {
        xpFillElement.style.width = `${xpProgress}%`;
    }
    const xpTextElement = document.getElementById('xpText');
    if (xpTextElement) {
        xpTextElement.textContent = `${currentProfile.xp} / ${currentProfile.xpToNextLevel}`;
    }
    
    // Try to initialize animated background (optional)
    try {
        if (typeof initMenuBackground === 'function') {
            initMenuBackground();
        }
    } catch (error) {
        console.log('Menu background animation disabled:', error.message);
    }
    
    console.log('=== SHOWING MAIN MENU ===');
    console.log('Current profile coins:', currentProfile.coins);
    console.log('Displaying:', currentProfile.coins);
    
    showScreen('mainMenu');
    currentState = GameState.MENU;
    
    // Start menu music
    Audio.startMenuMusic();
}

// ========================================
// FIGHTER HANGAR
// ========================================

// Generate SVG image for each fighter - matches in-game appearance with engine trails
function generateFighterSVG(fighter) {
    const color = fighter.color;
    
    // Each fighter has unique shape with animated boost effects
    const shipDesigns = {
        'FALCON': `
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <!-- Engine trail -->
                <defs>
                    <linearGradient id="trail-falcon" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#ff6600;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#ff6600;stop-opacity:0.8" />
                    </linearGradient>
                </defs>
                <rect x="5" y="55" width="20" height="10" fill="url(#trail-falcon)">
                    <animate attributeName="opacity" values="0.3;0.8;0.3" dur="0.6s" repeatCount="indefinite"/>
                    <animate attributeName="width" values="15;25;15" dur="0.6s" repeatCount="indefinite"/>
                </rect>
                <!-- Ship body -->
                <polygon points="90,60 30,30 30,90" fill="${color}" stroke="#fff" stroke-width="2"/>
                <rect x="48" y="45" width="10" height="30" fill="#fff" opacity="0.8"/>
                <rect x="20" y="52" width="15" height="16" fill="${color}" opacity="0.7"/>
                <rect x="22" y="55" width="8" height="10" fill="#ff6600"/>
            </svg>
        `,
        'THUNDER': `
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <!-- Triple engine trails -->
                <defs>
                    <linearGradient id="trail-thunder" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#ffff00;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#ffff00;stop-opacity:0.9" />
                    </linearGradient>
                </defs>
                <rect x="8" y="50" width="22" height="3" fill="url(#trail-thunder)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="0.4s" repeatCount="indefinite"/>
                </rect>
                <rect x="8" y="58" width="22" height="3" fill="url(#trail-thunder)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="0.4s" begin="0.13s" repeatCount="indefinite"/>
                </rect>
                <rect x="8" y="66" width="22" height="3" fill="url(#trail-thunder)">
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="0.4s" begin="0.27s" repeatCount="indefinite"/>
                </rect>
                <!-- Ship body -->
                <polygon points="85,60 35,40 35,80" fill="${color}" stroke="#fff" stroke-width="2"/>
                <rect x="50" y="48" width="8" height="24" fill="#fff" opacity="0.8"/>
                <rect x="25" y="52" width="15" height="4" fill="#ff6600"/>
                <rect x="25" y="60" width="15" height="4" fill="#ff6600"/>
                <rect x="25" y="68" width="15" height="4" fill="#ff6600"/>
            </svg>
        `,
        'PHANTOM': `
            <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
                <!-- Phase trail effect -->
                <defs>
                    <linearGradient id="trail-phantom" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#9900ff;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#9900ff;stop-opacity:0.7" />
                    </linearGradient>
                </defs>
                <ellipse cx="12" cy="65" rx="15" ry="10" fill="url(#trail-phantom)">
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="0.5s" repeatCount="indefinite"/>
                    <animate attributeName="rx" values="12;18;12" dur="0.5s" repeatCount="indefinite"/>
                </ellipse>
                <!-- Ship body -->
                <polygon points="100,65 25,50 25,80" fill="${color}" stroke="#fff" stroke-width="1.5"/>
                <polygon points="25,55 15,60 25,65" fill="${color}" opacity="0.6"/>
                <polygon points="25,65 15,70 25,75" fill="${color}" opacity="0.6"/>
                <ellipse cx="55" cy="65" rx="5" ry="8" fill="#fff" opacity="0.7"/>
                <rect x="12" y="61" width="8" height="8" fill="#9900ff" opacity="0.8"/>
            </svg>
        `,
        'AEGIS': `
            <svg viewBox="0 0 125 125" xmlns="http://www.w3.org/2000/svg">
                <!-- Dual engine boost -->
                <defs>
                    <linearGradient id="trail-aegis" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#00ff88;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#00ff88;stop-opacity:0.8" />
                    </linearGradient>
                </defs>
                <rect x="8" y="55" width="18" height="6" fill="url(#trail-aegis)">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.7s" repeatCount="indefinite"/>
                </rect>
                <rect x="8" y="64" width="18" height="6" fill="url(#trail-aegis)">
                    <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.7s" begin="0.35s" repeatCount="indefinite"/>
                </rect>
                <!-- Ship body -->
                <polygon points="85,62.5 65,35 40,35 30,62.5 40,90 65,90" fill="${color}" stroke="#fff" stroke-width="2.5"/>
                <rect x="35" y="45" width="25" height="8" fill="${color}" opacity="0.9"/>
                <rect x="35" y="72" width="25" height="8" fill="${color}" opacity="0.9"/>
                <rect x="48" y="55" width="10" height="15" fill="#00ff88" opacity="0.6"/>
                <rect x="22" y="57" width="12" height="11" fill="#ff6600"/>
            </svg>
        `,
        'VIPER': `
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                <!-- Missile trail glow -->
                <defs>
                    <radialGradient id="trail-viper">
                        <stop offset="0%" style="stop-color:#ff0099;stop-opacity:0.8" />
                        <stop offset="100%" style="stop-color:#ff0099;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <ellipse cx="18" cy="60" rx="20" ry="12" fill="url(#trail-viper)">
                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="0.6s" repeatCount="indefinite"/>
                    <animate attributeName="rx" values="15;25;15" dur="0.6s" repeatCount="indefinite"/>
                </ellipse>
                <!-- Ship body -->
                <polygon points="90,60 32,38 32,82" fill="${color}" stroke="#fff" stroke-width="2"/>
                <rect x="28" y="32" width="8" height="12" fill="${color}" opacity="0.9"/>
                <rect x="28" y="76" width="8" height="12" fill="${color}" opacity="0.9"/>
                <circle cx="32" cy="38" r="3" fill="#ffaa00"/>
                <circle cx="32" cy="82" r="3" fill="#ffaa00"/>
                <rect x="50" y="50" width="8" height="20" fill="#fff" opacity="0.8"/>
                <rect x="22" y="54" width="12" height="12" fill="#ff6600"/>
            </svg>
        `,
        'NOVA': `
            <svg viewBox="0 0 125 125" xmlns="http://www.w3.org/2000/svg">
                <!-- Explosive pulse trail -->
                <defs>
                    <radialGradient id="trail-nova">
                        <stop offset="0%" style="stop-color:#ff6600;stop-opacity:0.9" />
                        <stop offset="100%" style="stop-color:#ff6600;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="20" cy="62.5" r="15" fill="url(#trail-nova)">
                    <animate attributeName="r" values="10;20;10" dur="0.8s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="0.8s" repeatCount="indefinite"/>
                </circle>
                <!-- Ship body -->
                <polygon points="88,62.5 42,42 32,62.5 42,83" fill="${color}" stroke="#fff" stroke-width="2"/>
                <polygon points="42,50 35,62.5 42,75" fill="${color}" opacity="0.7"/>
                <circle cx="65" cy="62.5" r="15" fill="${color}" opacity="0.3"/>
                <polygon points="70,55 68,62.5 70,70 75,67 73,62.5 75,58" fill="#ffaa00" opacity="0.8"/>
                <rect x="52" cy="56" width="8" height="13" fill="#fff" opacity="0.8"/>
                <rect x="24" y="57" width="12" height="11" fill="#ff6600"/>
            </svg>
        `,
        'TITAN': `
            <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
                <!-- Heavy engine thrust -->
                <defs>
                    <linearGradient id="trail-titan" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#888888;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#888888;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect x="5" y="57" width="20" height="16" fill="url(#trail-titan)">
                    <animate attributeName="opacity" values="0.4;0.8;0.4" dur="0.8s" repeatCount="indefinite"/>
                    <animate attributeName="width" values="15;25;15" dur="0.8s" repeatCount="indefinite"/>
                </rect>
                <!-- Ship body -->
                <rect x="30" y="45" width="65" height="40" fill="${color}" stroke="#fff" stroke-width="3"/>
                <rect x="35" y="35" width="20" height="50" fill="${color}" opacity="0.8"/>
                <rect x="75" y="35" width="20" height="50" fill="${color}" opacity="0.8"/>
                <rect x="40" y="50" width="15" height="8" fill="#aaa"/>
                <rect x="40" y="72" width="15" height="8" fill="#aaa"/>
                <rect x="62" y="60" width="12" height="10" fill="#fff" opacity="0.8"/>
                <rect x="22" y="60" width="15" height="10" fill="#ff6600"/>
            </svg>
        `,
        'SPECTER': `
            <svg viewBox="0 0 125 125" xmlns="http://www.w3.org/2000/svg">
                <!-- Ghost trail fade -->
                <defs>
                    <linearGradient id="trail-specter" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#6600ff;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#6600ff;stop-opacity:0.6" />
                    </linearGradient>
                </defs>
                <ellipse cx="15" cy="62.5" rx="18" ry="15" fill="url(#trail-specter)">
                    <animate attributeName="opacity" values="0.2;0.6;0.2" dur="0.5s" repeatCount="indefinite"/>
                </ellipse>
                <polygon points="50,58 20,62.5 50,67" fill="${color}" opacity="0.3">
                    <animate attributeName="opacity" values="0.1;0.4;0.1" dur="0.5s" repeatCount="indefinite"/>
                </polygon>
                <!-- Ship body -->
                <polygon points="95,62.5 45,45 28,62.5 45,80" fill="${color}" stroke="#6600ff" stroke-width="1.5" opacity="0.85"/>
                <polygon points="45,52 38,62.5 45,73" fill="${color}" opacity="0.6"/>
                <line x1="45" y1="45" x2="60" y2="54" stroke="#6600ff" stroke-width="2" opacity="0.5"/>
                <line x1="45" y1="80" x2="60" y2="71" stroke="#6600ff" stroke-width="2" opacity="0.5"/>
                <ellipse cx="60" cy="62.5" rx="6" ry="10" fill="#6600ff" opacity="0.6"/>
                <rect x="20" y="58" width="12" height="9" fill="#6600ff" opacity="0.7"/>
            </svg>
        `,
        'COMET': `
            <svg viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg">
                <!-- Speed streak trail -->
                <defs>
                    <linearGradient id="trail-comet" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#00ddff;stop-opacity:0" />
                        <stop offset="100%" style="stop-color:#00ddff;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <line x1="2" y1="60" x2="20" y2="60" stroke="url(#trail-comet)" stroke-width="2">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" repeatCount="indefinite"/>
                </line>
                <line x1="2" y1="67.5" x2="18" y2="67.5" stroke="url(#trail-comet)" stroke-width="3">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="0.3s" begin="0.1s" repeatCount="indefinite"/>
                </line>
                <line x1="2" y1="75" x2="20" y2="75" stroke="url(#trail-comet)" stroke-width="2">
                    <animate attributeName="opacity" values="0.3;1;0.3" dur="0.3s" begin="0.2s" repeatCount="indefinite"/>
                </line>
                <!-- Ship body -->
                <polygon points="105,67.5 25,60 25,75" fill="${color}" stroke="#fff" stroke-width="1.5"/>
                <line x1="25" y1="62" x2="15" y2="58" stroke="${color}" stroke-width="3" opacity="0.6"/>
                <line x1="25" y1="67.5" x2="12" y2="67.5" stroke="${color}" stroke-width="3" opacity="0.6"/>
                <line x1="25" y1="73" x2="15" y2="77" stroke="${color}" stroke-width="3" opacity="0.6"/>
                <ellipse cx="60" cy="67.5" rx="4" ry="6" fill="#fff" opacity="0.8"/>
                <rect x="18" y="64" width="10" height="7" fill="#00ddff"/>
            </svg>
        `,
        'OMEGA': `
            <svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
                <!-- Power core pulse -->
                <defs>
                    <radialGradient id="trail-omega">
                        <stop offset="0%" style="stop-color:#ff0000;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#ff0000;stop-opacity:0" />
                    </radialGradient>
                </defs>
                <circle cx="18" cy="65" r="18" fill="url(#trail-omega)">
                    <animate attributeName="r" values="15;22;15" dur="0.9s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="0.9s" repeatCount="indefinite"/>
                </circle>
                <!-- Ship body -->
                <polygon points="95,65 38,38 30,65 38,92" fill="${color}" stroke="#fff" stroke-width="2.5"/>
                <path d="M55,55 Q50,65 55,75 M55,55 Q60,55 65,55 M55,75 Q60,75 65,75" stroke="#ffff00" stroke-width="2.5" fill="none"/>
                <rect x="32" y="32" width="10" height="15" fill="${color}" opacity="0.9"/>
                <rect x="32" y="83" width="10" height="15" fill="${color}" opacity="0.9"/>
                <rect x="58" y="56" width="10" height="18" fill="#fff" opacity="0.8"/>
                <rect x="22" y="60" width="14" height="10" fill="#ff0000"/>
            </svg>
        `
    };
    
    return shipDesigns[fighter.id] || shipDesigns['FALCON'];
}

function showHangar() {
    const grid = document.getElementById('fighterGrid');
    grid.innerHTML = '';
    
    Object.values(FIGHTERS).forEach(fighter => {
        const isUnlocked = currentFighters.unlocked.includes(fighter.id);
        const isSelected = currentProfile.selectedFighter === fighter.id;
        
        const card = document.createElement('div');
        card.className = 'fighter-card';
        if (!isUnlocked) card.classList.add('locked');
        if (isSelected) card.classList.add('selected');
        
        // Generate fighter SVG image
        const fighterImage = generateFighterSVG(fighter);
        
        card.innerHTML = `
            <div class="fighter-image">${fighterImage}</div>
            <div class="fighter-name">${fighter.name}</div>
            <div class="fighter-rarity rarity-${fighter.rarity}">${fighter.rarity}</div>
            <div class="fighter-description">${fighter.description}</div>
            <div class="fighter-stats">
                HP: ${fighter.stats.maxHealth} | Speed: ${fighter.stats.speed}<br>
                Fire Rate: ${(1/fighter.stats.shootCooldown).toFixed(1)}/s<br>
                Missiles: ${fighter.stats.missileCount}
            </div>
            <div class="fighter-ability">
                ${fighter.ability.name}: ${fighter.ability.description}
            </div>
            ${!isUnlocked ? '<p style="color:#ff3333;margin-top:10px;">LOCKED</p>' : ''}
            ${isSelected ? '<p style="color:#00ff00;margin-top:10px;">SELECTED</p>' : ''}
        `;
        
        if (isUnlocked) {
            card.addEventListener('click', () => {
                currentProfile.selectedFighter = fighter.id;
                StorageManager.saveProfile(currentProfile);
                showHangar();
            });
        }
        
        grid.appendChild(card);
    });
    
    showScreen('hangarScreen');
    currentState = GameState.HANGAR;
}

// Continued...

// ========================================
// GACHA SYSTEM
// ========================================

function showGachaScreen() {
    document.getElementById('gachaCoins').textContent = currentProfile.coins;
    showScreen('gachaScreen');
    currentState = GameState.GACHA;
}

function performSinglePull() {
    if (currentProfile.coins < GACHA_COST.SINGLE) {
        alert('Not enough coins!');
        return;
    }
    
    currentProfile.coins -= GACHA_COST.SINGLE;
    const result = performGachaPull();
    
    const isUnlocked = currentFighters.unlocked.includes(result.fighter.id);
    result.isDuplicate = isUnlocked;
    
    if (!isUnlocked) {
        currentFighters.unlocked.push(result.fighter.id);
    } else {
        // Duplicate compensation
        const compensation = DUPLICATE_COINS[result.rarity];
        currentProfile.coins += compensation;
    }
    
    StorageManager.saveProfile(currentProfile);
    StorageManager.saveFighters(currentFighters, currentProfile.username);
    
    showGachaResult([result]);
}

function performMultiPull() {
    if (currentProfile.coins < GACHA_COST.MULTI) {
        alert('Not enough coins!');
        return;
    }
    
    currentProfile.coins -= GACHA_COST.MULTI;
    const results = [];
    
    for (let i = 0; i < 10; i++) {
        const result = performGachaPull();
        const isUnlocked = currentFighters.unlocked.includes(result.fighter.id);
        result.isDuplicate = isUnlocked;
        
        if (!isUnlocked) {
            currentFighters.unlocked.push(result.fighter.id);
        } else {
            const compensation = DUPLICATE_COINS[result.rarity];
            currentProfile.coins += compensation;
        }
        
        results.push(result);
    }
    
    StorageManager.saveProfile(currentProfile);
    StorageManager.saveFighters(currentFighters, currentProfile.username);
    
    showGachaResult(results);
}

function showGachaResult(results) {
    const content = document.getElementById('gachaResultContent');
    content.innerHTML = '';
    
    results.forEach(result => {
        const div = document.createElement('div');
        div.className = 'gacha-result-item';
        div.classList.add(result.isDuplicate ? 'gacha-result-duplicate' : 'gacha-result-new');
        div.style.borderColor = result.fighter.color;
        
        const status = result.isDuplicate ? 
            `DUPLICATE (+${DUPLICATE_COINS[result.rarity]} coins)` : 
            'NEW!';
        
        div.innerHTML = `
            <div class="fighter-name">${result.fighter.name}</div>
            <div class="fighter-rarity rarity-${result.rarity}">${result.rarity}</div>
            <p style="color: ${result.isDuplicate ? '#888' : '#00ff00'}; font-weight: bold; margin-top: 10px;">
                ${status}
            </p>
        `;
        
        content.appendChild(div);
    });
    
    showScreen('gachaResultScreen');
}

// ========================================
// ADVENTURE MODE
// ========================================

function showAdventureScreen() {
    const grid = document.getElementById('chapterGrid');
    grid.innerHTML = '';
    
    CHAPTERS.forEach(chapter => {
        const isUnlocked = currentProgress.unlockedChapters.includes(chapter.id);
        const levels = getLevelsByChapter(chapter.id);
        const completedCount = levels.filter(l => 
            currentProgress.completedLevels.some(cl => cl.levelId === l.id)
        ).length;
        
        const card = document.createElement('div');
        card.className = 'chapter-card';
        if (!isUnlocked) card.classList.add('locked');
        
        card.innerHTML = `
            <div class="chapter-number">CHAPTER ${chapter.id}</div>
            <div class="chapter-name">${chapter.name}</div>
            <div class="chapter-description">${chapter.description}</div>
            <div class="chapter-progress">Progress: ${completedCount}/5 Levels</div>
        `;
        
        if (isUnlocked) {
            card.addEventListener('click', () => {
                showLevelSelect(chapter.id);
            });
        }
        
        grid.appendChild(card);
    });
    
    showScreen('adventureScreen');
    currentState = GameState.ADVENTURE;
}

function showLevelSelect(chapterId) {
    const chapter = getChapterById(chapterId);
    const levels = getLevelsByChapter(chapterId);
    
    document.getElementById('levelSelectTitle').textContent = chapter.name;
    
    const grid = document.getElementById('levelGrid');
    grid.innerHTML = '';
    
    levels.forEach(level => {
        const isUnlocked = isLevelUnlocked(level.id, currentProgress);
        const isCompleted = currentProgress.completedLevels.some(cl => cl.levelId === level.id);
        
        const card = document.createElement('div');
        card.className = 'level-card';
        if (!isUnlocked) card.classList.add('locked');
        if (isCompleted) card.classList.add('completed');
        
        card.innerHTML = `
            <div class="level-number">Level ${level.levelNum}</div>
            <div class="level-type">${level.isBoss ? 'BOSS FIGHT' : 'Combat Mission'}</div>
            <div class="level-rewards">
                +${level.rewards.coins} coins<br>
                +${level.rewards.xp} XP
            </div>
            ${isCompleted ? '<p style="color:#00ff00;margin-top:10px;">✓ COMPLETE</p>' : ''}
        `;
        
        if (isUnlocked) {
            card.addEventListener('click', () => {
                startGame(GameMode.ADVENTURE, level);
            });
        }
        
        grid.appendChild(card);
    });
    
    showScreen('levelSelectScreen');
}

// ========================================
// ARENA MODE
// ========================================

function showArenaScreen() {
    showScreen('arenaScreen');
    currentState = GameState.ARENA;
}

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.getAttribute('data-difficulty');
        startGame(GameMode.ARENA, null, difficulty);
    });
});

// ========================================
// INVENTORY
// ========================================

function showInventoryScreen() {
    document.getElementById('healthPotionCount').textContent = currentInventory.healthPotions;
    document.getElementById('shieldBoostCount').textContent = currentInventory.shieldBoosts;
    document.getElementById('damageBoostCount').textContent = currentInventory.damageBoosts;
    
    showScreen('inventoryScreen');
    currentState = GameState.INVENTORY;
}

function useHealthPotion() {
    if (currentInventory.healthPotions <= 0) {
        alert('No health potions available!');
        return;
    }
    
    if (currentState !== GameState.PLAYING || !player) {
        alert('Can only use during gameplay!');
        return;
    }
    
    if (player.health >= player.maxHealth) {
        alert('Health is already full!');
        return;
    }
    
    currentInventory.healthPotions--;
    player.health = Math.min(player.maxHealth, player.health + 50);
    playerHealth = player.health; // Sync both health variables
    StorageManager.saveInventory(currentInventory, currentProfile.username);
    updateHUD();
    alert('Health restored!');
}

// ========================================
// UPGRADE SYSTEM
// ========================================

function showUpgradeScreen() {
    document.getElementById('upgradeCoins').textContent = currentProfile.coins;
    showScreen('upgradeScreen');
    currentState = GameState.UPGRADE;
}

document.querySelectorAll('.upgrade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const upgradeType = btn.getAttribute('data-upgrade');
        performUpgrade(upgradeType);
    });
});

function performUpgrade(type) {
    const costs = { health: 500, speed: 400, damage: 600 };
    const cost = costs[type];
    
    if (currentProfile.coins < cost) {
        alert('Not enough coins!');
        return;
    }
    
    currentProfile.coins -= cost;
    upgrades[type]++;
    
    StorageManager.saveProfile(currentProfile);
    
    alert(`Upgraded ${type}! New level: ${upgrades[type]}`);
    showUpgradeScreen();
}

// ========================================
// LEADERBOARD
// ========================================

// Submit game result to backend
async function submitGameResult(gameData) {
    console.log('=== SUBMITTING GAME RESULT ===');
    console.log('Game data:', gameData);
    console.log('Targets destroyed:', gameData.targetsDestroyed);
    console.log('Expected coins:', gameData.targetsDestroyed);
    
    try {
        const response = await Config.fetch(Config.endpoints.submitResult, {
            method: 'POST',
            body: JSON.stringify(gameData)
        });
        
        if (!response.ok) {
            console.error('Backend response not OK:', response.status);
            throw new Error('Failed to submit game result');
        }
        
        const data = await response.json();
        console.log('✅ Game result submitted successfully:', data);
        
        // Sync coins and XP from backend response
        if (data.coinsEarned !== undefined) {
            console.log('💰 Coins earned from backend:', data.coinsEarned);
            // Coins already added locally, backend confirms
        }
        
        if (data.xpEarned !== undefined) {
            console.log('⭐ XP earned from backend:', data.xpEarned);
        }
        
        // Sync full profile from backend to ensure consistency
        await syncCoinsFromBackend();
        
        return data;
    } catch (error) {
        console.error('❌ Failed to submit game result:', error);
        console.error('Is backend running on localhost:3000?');
        console.log('💡 Coins saved locally, will sync when backend is available');
        return null;
    }
}

// Sync coins from backend to local profile
async function syncCoinsFromBackend() {
    console.log('=== SYNCING COINS FROM BACKEND ===');
    try {
        const response = await Config.fetch(Config.endpoints.status, {
            method: 'GET'
        });
        
        if (!response.ok) {
            console.log('⚠️ Could not sync coins from backend');
            return;
        }
        
        const data = await response.json();
        console.log('Backend response:', data);
        
        if (data.user && data.user.coins !== undefined) {
            const oldCoins = currentProfile.coins;
            const backendCoins = data.user.coins;
            
            // Only sync if backend coins are HIGHER (prevents losing locally earned coins)
            if (backendCoins > oldCoins) {
                currentProfile.coins = backendCoins;
                StorageManager.saveProfile(currentProfile);
                console.log(`✅ Synced coins from backend: ${oldCoins} → ${backendCoins}`);
                
                // Update menu display immediately
                const coinsElement = document.getElementById('profileCoins');
                if (coinsElement) {
                    coinsElement.textContent = currentProfile.coins;
                }
            } else {
                console.log(`✅ Local coins (${oldCoins}) >= Backend coins (${backendCoins}), keeping local`);
            }
        }
    } catch (error) {
        console.error('❌ Failed to sync coins:', error);
        console.error('Is backend running on localhost:3000?');
    }
}

async function showLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '<p style="color:#888;padding:20px;">Loading leaderboard...</p>';
    
    showScreen('leaderboardScreen');
    currentState = GameState.LEADERBOARD;
    
    try {
        // Fetch leaderboard from backend
        const response = await Config.fetch(`${Config.endpoints.leaderboard}?gameMode=quick_play&limit=50`, {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await response.json();
        const leaderboard = data.leaderboard || [];
        
        list.innerHTML = '';
        
        if (leaderboard.length === 0) {
            list.innerHTML = '<p style="color:#888;padding:20px;">No entries yet. Play to set a record!</p>';
        } else {
            leaderboard.forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'leaderboard-entry';
                if (index === 0) div.classList.add('rank-1');
                else if (index === 1) div.classList.add('rank-2');
                else if (index === 2) div.classList.add('rank-3');
                
                // Format play time if available
                let timeStr = '';
                if (entry.play_time !== undefined && entry.play_time !== null) {
                    const minutes = Math.floor(entry.play_time / 60);
                    const seconds = entry.play_time % 60;
                    timeStr = `<div class="leaderboard-time">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>`;
                }
                
                // Use display_name if available, otherwise username
                const displayName = entry.display_name || entry.username;
                
                div.innerHTML = `
                    <div class="leaderboard-rank">#${entry.rank || (index + 1)}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${displayName}</div>
                        <div class="leaderboard-fighter">${entry.fighter_used || entry.fighter}</div>
                    </div>
                    <div class="leaderboard-stats">
                        <div class="leaderboard-targets">${entry.targets_destroyed || 0} targets</div>
                        <div class="leaderboard-score">${entry.score || 0} pts</div>
                        ${timeStr}
                    </div>
                `;
                
                list.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Failed to load leaderboard:', error);
        // Fallback to LocalStorage if backend fails
        list.innerHTML = '<p style="color:#888;padding:20px;">Loading scores...</p>';
        
        let localLeaderboard = StorageManager.loadLeaderboard();
        
        // Deduplicate by username - keep only best score per user
        const userBestScores = {};
        localLeaderboard.forEach(entry => {
            if (!userBestScores[entry.username] || userBestScores[entry.username].score < entry.score) {
                userBestScores[entry.username] = entry;
            }
        });
        
        // Convert back to array and sort
        localLeaderboard = Object.values(userBestScores);
        localLeaderboard.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.targetsDestroyed - a.targetsDestroyed;
        });
        
        if (localLeaderboard.length > 0) {
            localLeaderboard.forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'leaderboard-entry';
                if (index === 0) div.classList.add('rank-1');
                else if (index === 1) div.classList.add('rank-2');
                else if (index === 2) div.classList.add('rank-3');
                
                let timeStr = '';
                if (entry.playTime !== undefined) {
                    const minutes = Math.floor(entry.playTime / 60);
                    const seconds = entry.playTime % 60;
                    timeStr = `<div class="leaderboard-time">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}</div>`;
                }
                
                div.innerHTML = `
                    <div class="leaderboard-rank">#${index + 1}</div>
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${entry.username}</div>
                        <div class="leaderboard-fighter">${entry.fighter}</div>
                    </div>
                    <div class="leaderboard-stats">
                        <div class="leaderboard-targets">${entry.targetsDestroyed} targets</div>
                        <div class="leaderboard-score">${entry.score} pts</div>
                        ${timeStr}
                    </div>
                `;
                
                list.appendChild(div);
            });
            
            // Save the deduplicated leaderboard back to localStorage
            StorageManager.saveLeaderboard(localLeaderboard);
        }
    }
}

// ========================================
// SETTINGS
// ========================================

function showSettingsScreen() {
    document.getElementById('soundToggle').checked = currentSettings.soundEnabled;
    document.getElementById('musicToggle').checked = currentSettings.musicEnabled;
    
    showScreen('settingsScreen');
    currentState = GameState.SETTINGS;
}

document.getElementById('soundToggle').addEventListener('change', (e) => {
    currentSettings.soundEnabled = e.target.checked;
    Audio.setSoundEnabled(e.target.checked);
    StorageManager.saveSettings(currentSettings);
});

document.getElementById('musicToggle').addEventListener('change', (e) => {
    currentSettings.musicEnabled = e.target.checked;
    Audio.setMusicEnabled(e.target.checked);
    StorageManager.saveSettings(currentSettings);
});

document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
        if (confirm('Really delete everything? This is your last chance!')) {
            StorageManager.clearAllData();
            alert('All data has been reset. Reloading...');
            location.reload();
        }
    }
});

// ========================================
// UI EVENT LISTENERS
// ========================================

// ========================================
// BUTTON SOUND EFFECTS
// ========================================

// Add click sound to all .menu-btn, .mode-btn, .mgmt-btn buttons
function addButtonSounds() {
    const buttons = document.querySelectorAll('.menu-btn, .mode-btn, .mgmt-btn, .quick-btn, button');
    
    buttons.forEach(button => {
        // Click sound
        button.addEventListener('click', () => {
            Audio.play('buttonClick');
        }, { capture: true, passive: true });
        
        // Hover sound
        button.addEventListener('mouseenter', () => {
            Audio.play('buttonHover', 0.3);
        }, { passive: true });
    });
    
    console.log(`🔊 Added sounds to ${buttons.length} buttons`);
}

// Call after DOM is ready
setTimeout(addButtonSounds, 100);

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
        document.getElementById('loginError').classList.remove('hidden');
        return;
    }
    
    const profile = StorageManager.loadProfile();
    if (profile && profile.username === username) {
        currentProfile = profile;
        currentProfile.lastLogin = Date.now();
        StorageManager.saveProfile(currentProfile);
        loadGameData();
        showMainMenu();
    } else {
        document.getElementById('loginError').textContent = 'Profile not found';
        document.getElementById('loginError').classList.remove('hidden');
    }
});

document.getElementById('newProfileBtn').addEventListener('click', () => {
    // Redirect to registration page
    window.location.href = 'register.html';
});

// Main Menu
document.getElementById('playBtn').addEventListener('click', () => {
    startGame(GameMode.QUICK_PLAY);
});

document.getElementById('adventureBtn').addEventListener('click', showAdventureScreen);
document.getElementById('arenaBtn').addEventListener('click', showArenaScreen);
document.getElementById('hangarBtn').addEventListener('click', showHangar);
document.getElementById('gachaBtn').addEventListener('click', showGachaScreen);
document.getElementById('inventoryBtn').addEventListener('click', showInventoryScreen);
document.getElementById('upgradeBtn').addEventListener('click', showUpgradeScreen);
document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
document.getElementById('settingsBtn').addEventListener('click', showSettingsScreen);

document.getElementById('logoutBtn').addEventListener('click', () => {
    // Clear backend session
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('userId');
    currentProfile = null;
    // Redirect to login page
    window.location.href = 'login.html';
});

// Gacha
document.getElementById('singlePullBtn').addEventListener('click', performSinglePull);
document.getElementById('multiPullBtn').addEventListener('click', performMultiPull);
document.getElementById('gachaBackBtn').addEventListener('click', showMainMenu);
document.getElementById('gachaResultOkBtn').addEventListener('click', showGachaScreen);

// Adventure
document.getElementById('adventureBackBtn').addEventListener('click', showMainMenu);
document.getElementById('levelSelectBackBtn').addEventListener('click', showAdventureScreen);

// Arena
document.getElementById('arenaBackBtn').addEventListener('click', showMainMenu);

// Inventory
document.getElementById('inventoryBackBtn').addEventListener('click', showMainMenu);
document.getElementById('useHealthPotionBtn').addEventListener('click', useHealthPotion);

// Upgrade
document.getElementById('upgradeBackBtn').addEventListener('click', showMainMenu);

// Leaderboard
document.getElementById('leaderboardBackBtn').addEventListener('click', showMainMenu);

// Settings
document.getElementById('settingsBackBtn').addEventListener('click', showMainMenu);

// Hangar
document.getElementById('hangarBackBtn').addEventListener('click', showMainMenu);

// Game screens
document.getElementById('restartBtn').addEventListener('click', () => {
    startGame(currentGameMode, currentLevel, arenaBot ? 'medium' : null);
});
document.getElementById('menuBtn').addEventListener('click', returnToMenu);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('quitBtn').addEventListener('click', returnToMenu);
document.getElementById('continueBtn').addEventListener('click', async () => {
    console.log('=== CONTINUE BUTTON CLICKED ===');
    console.log('Targets destroyed:', targetsDestroyed);
    console.log('Coins earned:', coinsEarned);
    console.log('Current coins before:', currentProfile.coins);
    
    // Add coins and XP locally (don't wait for backend)
    currentProfile.coins += coinsEarned;
    currentProfile.xp += xpEarned;
    
    console.log('Current coins after:', currentProfile.coins);
    
    // Check level up
    while (currentProfile.xp >= currentProfile.xpToNextLevel) {
        currentProfile.xp -= currentProfile.xpToNextLevel;
        currentProfile.level++;
        currentProfile.xpToNextLevel = Math.floor(100 * Math.pow(1.15, currentProfile.level - 1));
    }
    
    // Save to localStorage immediately
    StorageManager.saveProfile(currentProfile);
    console.log('Profile saved to localStorage');
    
    // Update display and return to menu
    showMainMenu();
});
document.getElementById('retryBtn').addEventListener('click', () => {
    startGame(currentGameMode, currentLevel, arenaBot ? 'medium' : null);
});

// ========================================
// START GAME
// ========================================

initStarfield();
requestAnimationFrame(update);
init();

console.log('SPACE STRIKE v1.0 - Fully Initialized');
console.log('Evaluation Ready: Loading, Login, 10 Fighters, Gacha, 50 Levels, Bot Arena, Economy, Inventory');


// ========================================
// UI ENHANCEMENTS - Galaxy Background
// ========================================

function createGalaxyStars() {
    const starsLayer = document.getElementById('starsLayer');
    if (!starsLayer) return;
    
    // Create 150 stars for rich galaxy effect
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Random size (1-3px)
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Random animation delay for twinkling
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        // Random opacity
        star.style.opacity = Math.random() * 0.7 + 0.3;
        
        starsLayer.appendChild(star);
    }
}

// Initialize galaxy on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createGalaxyStars);
} else {
    createGalaxyStars();
}

// ========================================
// MOBILE ORIENTATION DETECTION
// ========================================

function checkOrientation() {
    if (window.innerWidth <= 768) {
        // Mobile device detected
        if (window.innerHeight > window.innerWidth) {
            // Portrait mode - show rotation message
            document.body.classList.add('portrait-mode');
        } else {
            // Landscape mode - normal gameplay
            document.body.classList.remove('portrait-mode');
        }
    }
}

// Check orientation on load and resize
window.addEventListener('load', () => {
    checkOrientation();
    calculateHUDBoundary(); // Calculate HUD boundary on initial load
});
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => {
    setTimeout(checkOrientation, 100);
});

console.log('SPACE STRIKE v1.3 - Modern UI with Galaxy Background');
console.log('Mobile responsive with landscape orientation optimization');


// ========================================
// ANIMATED MENU BACKGROUND
// ========================================

function initMenuBackground() {
    menuBgCanvas = document.getElementById('menuBackgroundCanvas');
    if (!menuBgCanvas) {
        console.log('Menu background canvas not found, skipping animation');
        return;
    }
    
    menuBgCtx = menuBgCanvas.getContext('2d');
    if (!menuBgCtx) {
        console.log('Could not get canvas context');
        return;
    }
    
    menuBgCanvas.width = window.innerWidth;
    menuBgCanvas.height = window.innerHeight;
    
    // Create floating asteroids
    menuAsteroids = [];
    for (let i = 0; i < 8; i++) {
        menuAsteroids.push({
            x: Math.random() * menuBgCanvas.width,
            y: Math.random() * menuBgCanvas.height,
            size: 20 + Math.random() * 40,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: 0.3 + Math.random() * 0.3
        });
    }
    
    // Create shooting stars
    menuShootingStars = [];
    
    // Start animation
    if (menuBgAnimationFrame) {
        cancelAnimationFrame(menuBgAnimationFrame);
    }
    animateMenuBackground();
}

function animateMenuBackground() {
    if (!menuBgCanvas || !menuBgCtx) {
        console.log('Canvas not available, stopping animation');
        return;
    }
    
    menuBgCtx.clearRect(0, 0, menuBgCanvas.width, menuBgCanvas.height);
    
    // Draw floating asteroids
    menuAsteroids.forEach(asteroid => {
        // Update position
        asteroid.x += asteroid.speedX;
        asteroid.y += asteroid.speedY;
        asteroid.rotation += asteroid.rotationSpeed;
        
        // Wrap around screen
        if (asteroid.x < -asteroid.size) asteroid.x = menuBgCanvas.width + asteroid.size;
        if (asteroid.x > menuBgCanvas.width + asteroid.size) asteroid.x = -asteroid.size;
        if (asteroid.y < -asteroid.size) asteroid.y = menuBgCanvas.height + asteroid.size;
        if (asteroid.y > menuBgCanvas.height + asteroid.size) asteroid.y = -asteroid.size;
        
        // Draw asteroid
        menuBgCtx.save();
        menuBgCtx.translate(asteroid.x, asteroid.y);
        menuBgCtx.rotate(asteroid.rotation);
        menuBgCtx.globalAlpha = asteroid.opacity;
        
        // Asteroid shape (hexagon)
        menuBgCtx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * asteroid.size;
            const y = Math.sin(angle) * asteroid.size;
            if (i === 0) menuBgCtx.moveTo(x, y);
            else menuBgCtx.lineTo(x, y);
        }
        menuBgCtx.closePath();
        menuBgCtx.strokeStyle = '#555';
        menuBgCtx.lineWidth = 2;
        menuBgCtx.stroke();
        menuBgCtx.fillStyle = '#222';
        menuBgCtx.fill();
        
        // Add some detail lines
        menuBgCtx.beginPath();
        menuBgCtx.moveTo(-asteroid.size * 0.5, 0);
        menuBgCtx.lineTo(asteroid.size * 0.5, 0);
        menuBgCtx.strokeStyle = '#444';
        menuBgCtx.lineWidth = 1;
        menuBgCtx.stroke();
        
        menuBgCtx.restore();
    });
    
    // Spawn shooting stars occasionally
    if (Math.random() < 0.01) {
        menuShootingStars.push({
            x: Math.random() * menuBgCanvas.width,
            y: Math.random() * menuBgCanvas.height * 0.5,
            speedX: 4 + Math.random() * 4,
            speedY: 2 + Math.random() * 2,
            length: 40 + Math.random() * 60,
            life: 1.0
        });
    }
    
    // Draw and update shooting stars
    for (let i = menuShootingStars.length - 1; i >= 0; i--) {
        const star = menuShootingStars[i];
        
        star.x += star.speedX;
        star.y += star.speedY;
        star.life -= 0.01;
        
        if (star.life <= 0 || star.x > menuBgCanvas.width || star.y > menuBgCanvas.height) {
            menuShootingStars.splice(i, 1);
            continue;
        }
        
        // Draw shooting star trail
        const gradient = menuBgCtx.createLinearGradient(
            star.x - star.length,
            star.y - star.length * 0.5,
            star.x,
            star.y
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.life})`);
        
        menuBgCtx.strokeStyle = gradient;
        menuBgCtx.lineWidth = 2;
        menuBgCtx.beginPath();
        menuBgCtx.moveTo(star.x - star.length, star.y - star.length * 0.5);
        menuBgCtx.lineTo(star.x, star.y);
        menuBgCtx.stroke();
        
        // Draw star head
        menuBgCtx.fillStyle = `rgba(255, 255, 255, ${star.life})`;
        menuBgCtx.beginPath();
        menuBgCtx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        menuBgCtx.fill();
    }
    
    // Draw distant planets/moons
    const time = Date.now() / 10000;
    
    // Large distant planet
    const planetX = menuBgCanvas.width * 0.15 + Math.cos(time) * 20;
    const planetY = menuBgCanvas.height * 0.3 + Math.sin(time) * 10;
    const planetSize = 80;
    
    menuBgCtx.globalAlpha = 0.4;
    const planetGradient = menuBgCtx.createRadialGradient(
        planetX - planetSize * 0.3,
        planetY - planetSize * 0.3,
        0,
        planetX,
        planetY,
        planetSize
    );
    planetGradient.addColorStop(0, '#8a2be2');
    planetGradient.addColorStop(1, '#4b0082');
    
    menuBgCtx.fillStyle = planetGradient;
    menuBgCtx.beginPath();
    menuBgCtx.arc(planetX, planetY, planetSize, 0, Math.PI * 2);
    menuBgCtx.fill();
    
    // Small moon
    const moonX = menuBgCanvas.width * 0.85 + Math.cos(time * 1.5) * 15;
    const moonY = menuBgCanvas.height * 0.7 + Math.sin(time * 1.5) * 8;
    const moonSize = 40;
    
    menuBgCtx.globalAlpha = 0.3;
    menuBgCtx.fillStyle = '#555';
    menuBgCtx.beginPath();
    menuBgCtx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
    menuBgCtx.fill();
    
    menuBgCtx.globalAlpha = 1.0;
    
    menuBgAnimationFrame = requestAnimationFrame(animateMenuBackground);
}

// Stop menu background animation when leaving menu
function stopMenuBackground() {
    if (menuBgAnimationFrame) {
        cancelAnimationFrame(menuBgAnimationFrame);
        menuBgAnimationFrame = null;
    }
}
