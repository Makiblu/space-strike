// SPACE STRIKE - Local Storage Manager
// Handles all local save/load operations

const StorageManager = {
    KEYS: {
        PROFILE: 'spaceStrike_profile_', // Will append username
        PROGRESS: 'spaceStrike_progress_',
        FIGHTERS: 'spaceStrike_fighters_',
        INVENTORY: 'spaceStrike_inventory_',
        LEADERBOARD: 'spaceStrike_leaderboard',
        SETTINGS: 'spaceStrike_settings'
    },

    // ========================================
    // PROFILE MANAGEMENT (PER-USER)
    // ========================================

    saveProfile(profile) {
        try {
            if (!profile.username) {
                console.error('Cannot save profile without username');
                return false;
            }
            const key = this.KEYS.PROFILE + profile.username;
            localStorage.setItem(key, JSON.stringify(profile));
            console.log(`✅ Saved profile for user: ${profile.username}`);
            return true;
        } catch (e) {
            console.error('Failed to save profile:', e);
            return false;
        }
    },

    loadProfile(username) {
        try {
            if (!username) {
                console.error('Cannot load profile without username');
                return null;
            }
            const key = this.KEYS.PROFILE + username;
            const data = localStorage.getItem(key);
            if (!data) {
                console.log(`No profile found for user: ${username}`);
                return null;
            }
            console.log(`✅ Loaded profile for user: ${username}`);
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load profile:', e);
            return null;
        }
    },

    createDefaultProfile(username) {
        console.log(`🆕 Creating new profile for user: ${username}`);
        return {
            username: username,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            coins: 500, // Starting coins for new users
            selectedFighter: 'FALCON',
            wins: 0,
            totalKills: 0,
            bestScore: 0,
            gamesPlayed: 0,
            createdAt: Date.now(),
            lastLogin: Date.now()
        };
    },

    // ========================================
    // GAME PROGRESS (PER-USER)
    // ========================================

    saveProgress(progress, username) {
        try {
            if (!username) {
                console.error('Cannot save progress without username');
                return false;
            }
            const key = this.KEYS.PROGRESS + username;
            localStorage.setItem(key, JSON.stringify(progress));
            return true;
        } catch (e) {
            console.error('Failed to save progress:', e);
            return false;
        }
    },

    loadProgress(username) {
        try {
            if (!username) {
                return this.createDefaultProgress();
            }
            const key = this.KEYS.PROGRESS + username;
            const data = localStorage.getItem(key);
            if (!data) return this.createDefaultProgress();
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load progress:', e);
            return this.createDefaultProgress();
        }
    },

    createDefaultProgress() {
        return {
            currentChapter: 1,
            currentLevel: 1,
            unlockedChapters: [1],
            unlockedLevels: [{ chapter: 1, level: 1 }],
            completedLevels: [],
            bestScores: {}
        };
    },

    // ========================================
    // FIGHTER UNLOCKS (PER-USER)
    // ========================================

    saveFighters(fighters, username) {
        try {
            if (!username) {
                console.error('Cannot save fighters without username');
                return false;
            }
            const key = this.KEYS.FIGHTERS + username;
            localStorage.setItem(key, JSON.stringify(fighters));
            return true;
        } catch (e) {
            console.error('Failed to save fighters:', e);
            return false;
        }
    },

    loadFighters(username) {
        try {
            if (!username) {
                return this.createDefaultFighters();
            }
            const key = this.KEYS.FIGHTERS + username;
            const data = localStorage.getItem(key);
            if (!data) return this.createDefaultFighters();
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load fighters:', e);
            return this.createDefaultFighters();
        }
    },

    createDefaultFighters() {
        return {
            unlocked: ['FALCON'], // Start with one fighter
            upgrades: {}
        };
    },

    // ========================================
    // INVENTORY (PER-USER)
    // ========================================

    saveInventory(inventory, username) {
        try {
            if (!username) {
                console.error('Cannot save inventory without username');
                return false;
            }
            const key = this.KEYS.INVENTORY + username;
            localStorage.setItem(key, JSON.stringify(inventory));
            return true;
        } catch (e) {
            console.error('Failed to save inventory:', e);
            return false;
        }
    },

    loadInventory(username) {
        try {
            if (!username) {
                return this.createDefaultInventory();
            }
            const key = this.KEYS.INVENTORY + username;
            const data = localStorage.getItem(key);
            if (!data) return this.createDefaultInventory();
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load inventory:', e);
            return this.createDefaultInventory();
        }
    },

    createDefaultInventory() {
        return {
            healthPotions: 3, // Start with a few potions
            shieldBoosts: 0,
            damageBoosts: 0
        };
    },

    // ========================================
    // LEADERBOARD
    // ========================================

    saveLeaderboard(entries) {
        try {
            localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify(entries));
            return true;
        } catch (e) {
            console.error('Failed to save leaderboard:', e);
            return false;
        }
    },

    loadLeaderboard() {
        try {
            const data = localStorage.getItem(this.KEYS.LEADERBOARD);
            if (!data) return [];
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load leaderboard:', e);
            return [];
        }
    },

    addLeaderboardEntry(entry) {
        let leaderboard = this.loadLeaderboard();
        
        // Check if user already has entries
        const existingUserEntries = leaderboard.filter(e => e.username === entry.username);
        
        if (existingUserEntries.length > 0) {
            // Find user's best score
            const bestScore = Math.max(...existingUserEntries.map(e => e.score));
            
            // Only add if this score is better
            if (entry.score > bestScore) {
                // Remove all old entries for this user
                leaderboard = leaderboard.filter(e => e.username !== entry.username);
                // Add new best entry
                leaderboard.push({
                    ...entry,
                    timestamp: Date.now()
                });
            } else {
                // Score not better, don't add
                return leaderboard;
            }
        } else {
            // First entry for this user
            leaderboard.push({
                ...entry,
                timestamp: Date.now()
            });
        }
        
        // Sort by score (primary), then targets destroyed (secondary)
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return b.targetsDestroyed - a.targetsDestroyed;
        });
        
        // Keep top 50 unique users
        leaderboard = leaderboard.slice(0, 50);
        
        this.saveLeaderboard(leaderboard);
        return leaderboard;
    },

    // ========================================
    // SETTINGS
    // ========================================

    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    },

    loadSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            if (!data) return this.createDefaultSettings();
            return JSON.parse(data);
        } catch (e) {
            console.error('Failed to load settings:', e);
            return this.createDefaultSettings();
        }
    },

    createDefaultSettings() {
        return {
            soundEnabled: true,
            musicEnabled: true,
            volume: 0.7
        };
    },

    // ========================================
    // UTILITY
    // ========================================

    clearAllData() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (e) {
            console.error('Failed to clear data:', e);
            return false;
        }
    },

    exportData() {
        const data = {};
        Object.entries(this.KEYS).forEach(([name, key]) => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[name] = JSON.parse(value);
                } catch (e) {
                    data[name] = value;
                }
            }
        });
        return data;
    }
};
