// SPACE STRIKE - Fighter Configurations
// 10 unique fighters with different stats and abilities

const FIGHTERS = {
    FALCON: {
        id: 'FALCON',
        name: 'FALCON-X',
        description: 'Balanced all-around fighter with reliable performance',
        color: '#00ffff',
        rarity: 'COMMON',
        stats: {
            speed: 300,
            maxHealth: 100,
            shootCooldown: 0.2,
            projectileDamage: 10,
            missileCount: 3,
            missileCooldown: 5,
            missileDamage: 50
        },
        ability: {
            name: 'SHIELD BURST',
            cooldown: 10,
            duration: 3,
            type: 'shield',
            description: 'Temporary invincibility shield'
        }
    },
    
    THUNDER: {
        id: 'THUNDER',
        name: 'THUNDER',
        description: 'Rapid-fire specialist with blazing gun speed',
        color: '#ffff00',
        rarity: 'COMMON',
        stats: {
            speed: 280,
            maxHealth: 90,
            shootCooldown: 0.1,  // 2x faster shooting
            projectileDamage: 8,
            missileCount: 2,
            missileCooldown: 6,
            missileDamage: 45
        },
        ability: {
            name: 'RAPID FIRE',
            cooldown: 12,
            duration: 5,
            type: 'rapid',
            description: 'Triple shot burst fire'
        }
    },
    
    PHANTOM: {
        id: 'PHANTOM',
        name: 'PHANTOM',
        description: 'Ultra-fast interceptor with superior agility',
        color: '#9900ff',
        rarity: 'RARE',
        stats: {
            speed: 400,  // 33% faster
            maxHealth: 80,
            shootCooldown: 0.25,
            projectileDamage: 10,
            missileCount: 2,
            missileCooldown: 5,
            missileDamage: 40
        },
        ability: {
            name: 'PHASE SHIFT',
            cooldown: 8,
            duration: 2,
            type: 'phase',
            description: 'Pass through all obstacles'
        }
    },

    AEGIS: {
        id: 'AEGIS',
        name: 'AEGIS',
        description: 'Defensive fortress with energy shielding',
        color: '#00ff88',
        rarity: 'RARE',
        stats: {
            speed: 250,
            maxHealth: 150,  // 50% more HP
            shootCooldown: 0.25,
            projectileDamage: 10,
            missileCount: 3,
            missileCooldown: 5,
            missileDamage: 45
        },
        ability: {
            name: 'FORTRESS MODE',
            cooldown: 15,
            duration: 5,
            type: 'fortress',
            description: 'Regenerate health and reduce damage'
        }
    },

    VIPER: {
        id: 'VIPER',
        name: 'VIPER',
        description: 'Missile specialist with devastating warheads',
        color: '#ff0099',
        rarity: 'RARE',
        stats: {
            speed: 290,
            maxHealth: 100,
            shootCooldown: 0.22,
            projectileDamage: 9,
            missileCount: 6,  // Double missiles
            missileCooldown: 4,
            missileDamage: 70  // More missile damage
        },
        ability: {
            name: 'MISSILE BARRAGE',
            cooldown: 10,
            duration: 0,
            type: 'barrage',
            description: 'Fire 5 homing missiles instantly'
        }
    },

    NOVA: {
        id: 'NOVA',
        name: 'NOVA',
        description: 'Area damage specialist with explosive rounds',
        color: '#ff6600',
        rarity: 'EPIC',
        stats: {
            speed: 270,
            maxHealth: 100,
            shootCooldown: 0.3,
            projectileDamage: 15,
            missileCount: 3,
            missileCooldown: 6,
            missileDamage: 60
        },
        ability: {
            name: 'SUPERNOVA',
            cooldown: 14,
            duration: 0,
            type: 'supernova',
            description: 'Massive explosion damaging all enemies'
        }
    },

    TITAN: {
        id: 'TITAN',
        name: 'TITAN',
        description: 'Heavy assault tank with maximum armor',
        color: '#888888',
        rarity: 'EPIC',
        stats: {
            speed: 220,  // Slower
            maxHealth: 180,  // Highest HP
            shootCooldown: 0.3,
            projectileDamage: 15,
            missileCount: 4,
            missileCooldown: 7,
            missileDamage: 55
        },
        ability: {
            name: 'IRON WALL',
            cooldown: 18,
            duration: 6,
            type: 'ironwall',
            description: 'Massive damage reduction and knockback immunity'
        }
    },

    SPECTER: {
        id: 'SPECTER',
        name: 'SPECTER',
        description: 'Stealth fighter with evasion technology',
        color: '#6600ff',
        rarity: 'EPIC',
        stats: {
            speed: 330,
            maxHealth: 75,  // Low HP
            shootCooldown: 0.18,
            projectileDamage: 12,
            missileCount: 2,
            missileCooldown: 5,
            missileDamage: 50
        },
        ability: {
            name: 'GHOST MODE',
            cooldown: 9,
            duration: 3,
            type: 'ghost',
            description: 'Become invisible and untargetable'
        }
    },

    COMET: {
        id: 'COMET',
        name: 'COMET',
        description: 'Lightning-fast striker with hit-and-run tactics',
        color: '#00ddff',
        rarity: 'LEGENDARY',
        stats: {
            speed: 450,  // Fastest
            maxHealth: 70,
            shootCooldown: 0.15,
            projectileDamage: 11,
            missileCount: 3,
            missileCooldown: 4,
            missileDamage: 55
        },
        ability: {
            name: 'SONIC DASH',
            cooldown: 7,
            duration: 1.5,
            type: 'dash',
            description: 'Ultra speed boost with damage trail'
        }
    },

    OMEGA: {
        id: 'OMEGA',
        name: 'OMEGA',
        description: 'Ultimate weapon with devastating special attack',
        color: '#ff0000',
        rarity: 'LEGENDARY',
        stats: {
            speed: 300,
            maxHealth: 120,
            shootCooldown: 0.18,
            projectileDamage: 14,
            missileCount: 4,
            missileCooldown: 5,
            missileDamage: 65
        },
        ability: {
            name: 'OMEGA STRIKE',
            cooldown: 20,
            duration: 4,
            type: 'omega',
            description: 'Massive damage beam with piercing effect'
        }
    }
};

// Gacha drop rates
const GACHA_RATES = {
    COMMON: 0.50,    // 50%
    RARE: 0.30,      // 30%
    EPIC: 0.15,      // 15%
    LEGENDARY: 0.05  // 5%
};

const GACHA_COST = {
    SINGLE: 200,
    MULTI: 1800  // 10% discount
};

// Get fighters by rarity
function getFightersByRarity(rarity) {
    return Object.values(FIGHTERS).filter(f => f.rarity === rarity);
}

// Perform gacha pull
function performGachaPull() {
    const roll = Math.random();
    let rarity;
    
    if (roll < GACHA_RATES.LEGENDARY) {
        rarity = 'LEGENDARY';
    } else if (roll < GACHA_RATES.LEGENDARY + GACHA_RATES.EPIC) {
        rarity = 'EPIC';
    } else if (roll < GACHA_RATES.LEGENDARY + GACHA_RATES.EPIC + GACHA_RATES.RARE) {
        rarity = 'RARE';
    } else {
        rarity = 'COMMON';
    }
    
    const pool = getFightersByRarity(rarity);
    const fighter = pool[Math.floor(Math.random() * pool.length)];
    
    return {
        fighter: fighter,
        rarity: rarity,
        isDuplicate: false  // Will be determined by caller
    };
}

// Duplicate compensation
const DUPLICATE_COINS = {
    COMMON: 50,
    RARE: 150,
    EPIC: 400,
    LEGENDARY: 1000
};
