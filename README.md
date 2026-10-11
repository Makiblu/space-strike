# SPACE STRIKE v1.0
## Browser-Based 2D Arcade Space Shooter

**Build Version:** 1.0  
**Build Date:** October 8, 2026  
**Target:** Windows PC, Google Chrome  
**Status:** Playtest Ready

---

## QUICK START

### How to Play

1. Navigate to the project folder: `C:\Users\User\OneDrive\Desktop\SPACE FIGHTER`
2. Open `index.html` in Google Chrome
3. Wait for the loading screen to complete
4. Create a profile or login
5. Start playing!

### Controls

| Action | Key |
|--------|-----|
| Move | WASD or Arrow Keys |
| Shoot | SPACE |
| Missile | X |
| Special Ability | C |
| Pause | ESC |

---

## GAME MODES

### Quick Play
Fast arcade action with endless waves of enemies and asteroids. Survive as long as possible and set high scores.

### Adventure Mode
- **10 Chapters** with distinct themes
- **5 Levels per chapter** (50 total levels)
- **4 regular encounters + 1 boss per level**
- Progressive difficulty
- Unlock new chapters by completing levels
- Earn coins and XP rewards

### Bot Arena
Simulated PvP combat against AI-controlled opponents
- 3 difficulty levels: Easy, Medium, Hard
- Bots use actual fighter abilities
- Win rewards: coins and XP

---

## FIGHTER ROSTER

### 10 Unique Fighters

1. **FALCON-X** (Common) - Balanced all-rounder with Shield Burst ability
2. **THUNDER** (Common) - Rapid-fire specialist with triple shot
3. **PHANTOM** (Rare) - Ultra-fast with Phase Shift ability
4. **AEGIS** (Rare) - Defensive tank with Fortress Mode
5. **VIPER** (Rare) - Missile specialist with Missile Barrage
6. **NOVA** (Epic) - Area damage with Supernova explosion
7. **TITAN** (Epic) - Heavy armor with Iron Wall defense
8. **SPECTER** (Epic) - Stealth fighter with Ghost Mode
9. **COMET** (Legendary) - Lightning speed with Sonic Dash
10. **OMEGA** (Legendary) - Ultimate power with Omega Strike beam

Each fighter has unique stats:
- Health
- Movement Speed
- Fire Rate
- Missile Count
- Special Ability

---

## CHARACTER UNLOCK SYSTEM (GACHA)

### Recruitment Mechanics
- **Single Pull:** 200 coins
- **10-Pull:** 1800 coins (10% discount)

### Drop Rates
- ★★★★ LEGENDARY: 5%
- ★★★ EPIC: 15%
- ★★ RARE: 30%
- ★ COMMON: 50%

### Duplicate Rewards
Pulling a fighter you already own awards compensation coins:
- Common: 50 coins
- Rare: 150 coins
- Epic: 400 coins
- Legendary: 1000 coins

---

## ECONOMY SYSTEM

### Coins
Earned from:
- Completing levels
- Defeating bosses
- Winning arena matches
- Duplicate gacha pulls

Spent on:
- Gacha recruitment
- Upgrades

### XP and Leveling
- Gain XP from missions and arena
- Level up your pilot profile
- XP requirement increases with each level

### Inventory
- **Health Potions:** Restore 50 HP (usable during gameplay)
- **Shield Boosts:** Temporary protection (coming soon)
- **Damage Boosts:** Increased firepower (coming soon)

### Upgrades
Permanent improvements using coins:
- **Max Health +10:** 500 coins
- **Movement Speed +10%:** 400 coins
- **Damage +2:** 600 coins

---

## PROGRESSION SYSTEM

### Chapters (10 Total)

1. **The Asteroid Belt** - Outer rim hazards
2. **Pirate Territory** - Organized enemy squadrons
3. **Nebula Storm** - Hazardous space weather
4. **Mining Colony** - Liberate captured facilities
5. **Enemy Fleet** - Main invasion force
6. **Dark Sector** - Unknown void exploration
7. **Weapons Facility** - Destroy production center
8. **Core Systems** - Heart of enemy territory
9. **Command Ship** - Flagship assault
10. **Final Stand** - Ultimate battle

### Level Structure
Each level includes:
- 4 regular enemy encounters
- 1 boss encounter
- Coin and XP rewards
- Unlock progression

### Boss Fights
Each chapter culminates in a boss battle with:
- Unique attack patterns
- Large health pool
- Visible boss health bar
- High reward values

---

## SAVE SYSTEM

All progress is saved locally using browser LocalStorage:
- Player profile and level
- Unlocked fighters
- Completed levels
- Inventory items
- Upgrades
- Settings
- Leaderboard entries

**Important:** Saves are local to your browser on this device. Clearing browser data will erase saves.

---

## LEADERBOARD

Local rankings sorted by:
1. **Primary:** Targets Destroyed
2. **Secondary:** Total Score

Top 50 entries are saved.

---

## FEATURES IMPLEMENTED

### Core Gameplay ✓
- [x] Player movement with boundary constraints
- [x] Normal shooting with cooldown
- [x] Missile attacks with homing
- [x] Special abilities (10 unique types)
- [x] Enemy spawning and AI
- [x] Asteroid obstacles
- [x] Boss encounters
- [x] Collision detection
- [x] Health and damage system
- [x] Particle effects
- [x] Animated starfield

### UI/UX ✓
- [x] Loading screen with progress
- [x] Login/profile system
- [x] Main menu hub
- [x] Fighter hangar with selection
- [x] Gacha recruitment screen
- [x] Chapter selection
- [x] Level selection
- [x] Arena mode setup
- [x] Inventory management
- [x] Upgrade shop
- [x] Leaderboard display
- [x] Settings panel
- [x] Pause menu
- [x] Results screen
- [x] Game over screen

### Progression ✓
- [x] 10 fighter configurations
- [x] Gacha system with probabilities
- [x] 10 chapters defined
- [x] 50 levels configured
- [x] Boss configurations for each chapter
- [x] Level unlock progression
- [x] Coin economy
- [x] XP and leveling
- [x] Upgrade system
- [x] Inventory items

### Persistence ✓
- [x] Profile save/load
- [x] Progress save/load
- [x] Fighter unlock save/load
- [x] Inventory save/load
- [x] Leaderboard persistence
- [x] Settings persistence

---

## KNOWN LIMITATIONS

### Not Implemented
- Sound effects (system exists, assets not added)
- Background music (system exists, assets not added)
- Mobile touch controls (desktop-first)
- Advanced enemy AI behaviors
- Shield and damage boost item functionality
- Multiple boss attack patterns (basic implementation)
- Achievement system
- Daily rewards
- Multiplayer (intentionally out of scope)

### Testing Status
- ✓ Core shooter gameplay
- ✓ Menu navigation
- ✓ Fighter selection
- ✓ Profile system
- ⚠ All 50 levels (data exists, only first levels tested)
- ⚠ Boss encounters (basic implementation)
- ⚠ Arena bot AI (basic implementation)
- ✓ Gacha mechanics
- ✓ Inventory system
- ✓ Upgrade system
- ✓ Leaderboard
- ✓ Save/load persistence

---

## PLAYTEST PREPARATION

This build is ready for the **Game Playtest Evaluation Form** covering:

1. **Loading Screen** - Initialization and transition
2. **User Login System** - Profile creation and progress saving
3. **Character Roster** - 10 unique fighters with distinct abilities
4. **Gacha System** - Fair recruitment with displayed probabilities
5. **Adventure Mode** - 10 chapters, 50 levels, boss encounters
6. **Bot Arena** - AI opponents with difficulty settings
7. **Economy & Inventory** - Coins, XP, potions, upgrades

---

## TROUBLESHOOTING

### Game won't load
- Ensure you're using a modern browser (Chrome recommended)
- Check browser console for errors (F12)
- Try hard refresh (Ctrl+Shift+R)

### Save data lost
- Check if browser is in incognito/private mode
- Verify browser isn't clearing site data automatically
- Export data from settings before testing

### Performance issues
- Close other browser tabs
- Check system resources
- Reduce browser zoom level

### Bugs or glitches
- Note the specific screen and action
- Check browser console for errors
- Record steps to reproduce

---

## DEVELOPMENT NOTES

**Technology Stack:**
- HTML5
- CSS3
- Vanilla JavaScript
- Canvas 2D API
- LocalStorage API

**Project Structure:**
```
SPACE FIGHTER/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js (game engine, ~1000 lines)
│   ├── storage.js (save system)
│   ├── fighters.js (10 fighter configs)
│   └── chapters.js (50 level definitions)
└── README.md
```

**Code Architecture:**
- Modular systems (player, enemies, projectiles, missiles, bosses)
- Data-driven configuration for fighters and levels
- Reusable collision detection
- Delta-time based movement
- State machine for game flow
- Event-driven UI

---

## CREDITS

**Developer:** AI-Assisted Development via Kiro IDE  
**Engine:** Custom HTML5 Canvas Game Engine  
**Graphics:** Procedurally drawn Canvas shapes  
**Target Platform:** Browser (Chrome on Windows PC)

---

## VERSION HISTORY

### v1.0 (October 8, 2026)
- Initial playtest-ready build
- All 7 evaluation categories implemented
- 10 fighters with unique abilities
- 50 level definitions across 10 chapters
- Full economy and progression systems
- Local save/load functionality
- Gacha recruitment system
- Bot arena mode

---

**For questions, bug reports, or feedback, use the in-game systems or contact the development team.**

**SPACE STRIKE - Destroy All Targets!**
