# SPACE STRIKE - Playtest Instructions
## For First-Year and Second-Year Student Testers

**Game:** SPACE STRIKE v1.0  
**Type:** 2D Browser-Based Arcade Space Shooter  
**Platform:** Windows PC, Google Chrome  
**Test Duration:** 20-30 minutes recommended

---

## BEFORE YOU BEGIN

### Requirements
- Windows PC
- Google Chrome browser (or modern browser)
- Keyboard
- 20-30 minutes of uninterrupted time

### What You'll Be Testing
This playtest focuses on **7 core systems**:
1. Loading Screen
2. Login/Profile System
3. Character Roster (10 Fighters)
4. Gacha (Character Unlock)
5. Adventure Mode (10 Chapters, 50 Levels)
6. Bot Arena (PvP Simulation)
7. Economy & Inventory

---

## STEP 1: LAUNCH THE GAME

### How to Start

1. Open File Explorer
2. Navigate to: `C:\Users\User\OneDrive\Desktop\SPACE FIGHTER`
3. Find the file named `index.html`
4. **Right-click** on `index.html`
5. Select **"Open with"** → **Google Chrome**

**OR**

1. Open Google Chrome
2. Press `Ctrl+O` to open a file
3. Navigate to the SPACE FIGHTER folder
4. Select `index.html`
5. Click **Open**

### What to Expect
- A loading screen will appear
- Progress bar will fill
- Text will show loading stages
- After 2-3 seconds, you'll see the login screen

**✓ CHECK:** Did the loading screen appear and complete smoothly?

---

## STEP 2: CREATE YOUR PROFILE

### Instructions

1. You'll see a **"SPACE STRIKE"** title with an input box
2. Type a username (any name, 1-20 characters)
3. Click **"NEW PROFILE"**
4. You should be taken to the Main Menu

**✓ CHECK:** Were you able to create a profile successfully?

### Test Login Persistence

1. After creating your profile, close the browser tab
2. Reopen `index.html` in Chrome
3. The loading screen will appear again
4. Type your **same username**
5. Click **"LOGIN"**
6. You should return to the Main Menu with your progress intact

**✓ CHECK:** Did your profile load correctly after reopening?

---

## STEP 3: EXPLORE THE MAIN MENU

From the Main Menu, you should see:
- Your username ("Welcome, [Name]")
- Your level and coins
- Multiple buttons

**Available Options:**
- QUICK PLAY
- ADVENTURE MODE
- BOT ARENA
- FIGHTER HANGAR
- RECRUIT FIGHTERS
- INVENTORY
- UPGRADES
- LEADERBOARD
- SETTINGS
- LOGOUT

**✓ CHECK:** Are all buttons visible and clickable?

---

## STEP 4: TEST CHARACTER ROSTER (Fighter Hangar)

### Instructions

1. Click **"FIGHTER HANGAR"**
2. You'll see a grid of 10 fighter cards
3. Only **FALCON-X** should be unlocked (you start with this fighter)
4. Others will show **"LOCKED"**

### What to Check

For each visible fighter:
- Is the fighter name visible?
- Is there a rarity indicator (★ COMMON, ★★ RARE, etc.)?
- Can you see stats (HP, Speed, Fire Rate, Missiles)?
- Is there an ability description?

### Select a Fighter

1. Click on **FALCON-X** (the only unlocked fighter)
2. The card should highlight with a green border
3. Text should say **"SELECTED"**

**✓ EVALUATION CHECKPOINT:**
- **Visual Design:** Are the cards readable and attractive?
- **Roster Uniqueness:** Do the 10 fighters have different names, rarities, and abilities?
- **Animations:** Does selection feel responsive?

---

## STEP 5: TEST GACHA SYSTEM (Recruit Fighters)

### Instructions

1. Go back to Main Menu (click **BACK**)
2. Click **"RECRUIT FIGHTERS"**
3. You should see:
   - Your current coin balance (starts at 1000)
   - Drop rates displayed clearly
   - SINGLE PULL button (200 coins)
   - 10-PULL button (1800 coins)

### Perform a Single Pull

1. Click **"SINGLE PULL"**
2. 200 coins will be deducted
3. A result screen will appear showing what you received
4. Check if it says **"NEW!"** or **"DUPLICATE"**
5. Click **OK**

### Check Your Coins

- If you got a NEW fighter: coins = 1000 - 200 = 800
- If you got a DUPLICATE: coins = 800 + compensation (50-1000 depending on rarity)

### Verify Unlock

1. Return to Main Menu
2. Go to **FIGHTER HANGAR**
3. Your newly unlocked fighter should now be selectable

**✓ EVALUATION CHECKPOINT:**
- **Pull Mechanics:** Did the gacha work correctly?
- **Drop-Rate Transparency:** Were probabilities clearly shown?
- **Fairness:** Did duplicates give compensation?

---

## STEP 6: TEST QUICK PLAY (Core Gameplay)

### Start a Quick Play Session

1. Return to Main Menu
2. Click **"QUICK PLAY"**
3. The game will start immediately

### Learn the Controls

| Action | Key |
|--------|-----|
| Move Up | W or ↑ |
| Move Down | S or ↓ |
| Move Left | A or ← |
| Move Right | D or → |
| Shoot | SPACE |
| Missile | X |
| Special Ability | C |
| Pause | ESC |

### What to Do

1. **Move around** - Try all 4 directions
2. **Shoot** - Hold SPACE to fire
3. **Destroy targets** - Red hexagonal enemies
4. **Avoid asteroids** - Gray rotating rocks
5. **Watch your health** - Top left corner
6. **Use a missile** - Press X (limited quantity)
7. **Activate ability** - Press C when ready
8. **Pause** - Press ESC, then Resume

### Survive Until Game Over

- Enemies and asteroids will damage you
- When health reaches 0, you'll see **GAME OVER**
- Your final targets destroyed and score will be displayed

### Check the Leaderboard

1. After Game Over, click **MAIN MENU**
2. Click **"LEADERBOARD"**
3. Your result should appear in the rankings

**✓ EVALUATION CHECKPOINT:**
- Does the player move smoothly?
- Do projectiles hit enemies correctly?
- Does the HUD update properly?
- Is the game fun and responsive?

---

## STEP 7: TEST ADVENTURE MODE

### Navigate to Adventure

1. Main Menu → **"ADVENTURE MODE"**
2. You'll see 10 chapter cards
3. Only **Chapter 1** is unlocked initially

### Select Chapter 1

1. Click on **"THE ASTEROID BELT"**
2. You'll see 5 level cards
3. Only **Level 1** is unlocked

### Play Level 1

1. Click **"Level 1"**
2. The game starts
3. You'll face enemy waves
4. This is a regular combat level (no boss yet)

### Check Mission Completion

- Try to survive and destroy enemies
- When you die, you'll see results
- If you complete the level, you'll earn coins and XP
- **Level 2** should unlock

### Play Level 5 (Boss Fight)

If you unlock it:
1. Level 5 shows **"BOSS FIGHT"**
2. Play until a large boss enemy appears
3. The boss has a health bar at the top
4. Defeat it to complete the level

**✓ EVALUATION CHECKPOINT:**
- **Chapter Structure:** Are 10 chapters visible?
- **Level Progression:** Does unlocking work?
- **Boss Balance:** Is the boss challenging but fair?

---

## STEP 8: TEST BOT ARENA

### Enter Arena Mode

1. Main Menu → **"BOT ARENA"**
2. Select difficulty: **EASY**, **MEDIUM**, or **HARD**

### Fight the Bot

- The bot is an AI-controlled enemy fighter
- It will move and shoot at you
- Defeat it to win
- You'll earn coins and XP

**✓ EVALUATION CHECKPOINT:**
- **Bot Behavior:** Does the bot attack and move?
- **Difficulty Levels:** Is there a noticeable difference?
- **Challenge:** Is it engaging to fight?

---

## STEP 9: TEST ECONOMY & INVENTORY

### Check Your Coins and XP

1. Main Menu - Look at your profile info
2. Note your current coins and level

### Visit Inventory

1. Click **"INVENTORY"**
2. You should see:
   - Health Potions (you start with 3)
   - Shield Boosts
   - Damage Boosts

### Use a Health Potion

1. Start a Quick Play or level
2. Take damage
3. Pause the game (ESC)
4. *Note: Cannot access inventory during gameplay in current version*
5. Use potions from inventory screen when not playing

### Visit Upgrade Shop

1. Main Menu → **"UPGRADES"**
2. You should see three upgrades:
   - Max Health +10 (500 coins)
   - Movement Speed +10% (400 coins)
   - Damage +2 (600 coins)

### Purchase an Upgrade

1. If you have enough coins, click **UPGRADE**
2. Coins will be deducted
3. Your stats will improve for future games

**✓ EVALUATION CHECKPOINT:**
- **Coin System:** Do you earn coins from missions?
- **XP Pacing:** Does leveling feel fair?
- **Potion Utility:** Are items useful?
- **Clarity:** Is the economy easy to understand?

---

## STEP 10: TEST SETTINGS

### Open Settings

1. Main Menu → **"SETTINGS"**
2. Check the options:
   - Sound Effects toggle
   - Music toggle
   - Control instructions

### Test Data Reset

1. Scroll to **"RESET ALL DATA"**
2. **DO NOT CLICK** unless you want to erase everything
3. This is available for testing reset functionality

---

## IMPORTANT: WHAT TO RECORD

While testing, please note:

### 1. Overall Experience (1-5 stars)
- How fun was the game?
- Was it easy to understand?
- Did it feel complete?

### 2. System-Specific Ratings (1-5 each)

**Loading Screen:**
- Loading speed
- UI design
- Smooth transition

**User Login:**
- Account setup reliability
- Progress saving

**Character Roster:**
- Visual design
- Fluid animations (if any)
- Fighter uniqueness

**Gacha:**
- Pull mechanics
- Drop-rate excitement
- Fairness

**Adventure Mode:**
- 10 chapters present?
- 5 levels per chapter?
- Boss encounters working?
- Level balance

**Bot Arena:**
- Bot challenge
- Tactical depth
- Engagement

**Economy & Inventory:**
- Coin clarity
- XP pacing
- Potion utility
- Upgrade system

### 3. Bugs and Glitches
Note any:
- Crashes or freezes
- Visual glitches
- Incorrect numbers
- Broken buttons
- Confusing behavior

### 4. Suggestions
- Favorite mechanic and why
- Feature needing improvement
- Balance suggestions

---

## TIPS FOR EFFECTIVE TESTING

### Do:
✓ Try clicking all buttons  
✓ Test edge cases (e.g., buying with 0 coins)  
✓ Check if saves persist after closing  
✓ Note anything confusing  
✓ Test all game modes  

### Don't:
✗ Rush through without exploring  
✗ Skip the evaluation form  
✗ Forget to note bugs when they happen  
✗ Test on an unsupported browser  

---

## TROUBLESHOOTING

### "Game won't start"
- Refresh the page (F5)
- Clear browser cache
- Try a different browser

### "My save data is gone"
- Check if browser is in Private/Incognito mode
- Verify you're using the same browser

### "Performance is slow"
- Close other tabs
- Check system resources
- Restart browser

### "I found a bug"
- Note what screen you were on
- Note what you clicked
- Note what happened vs. what you expected
- Check browser console (F12) for error messages

---

## AFTER TESTING

### Complete the Evaluation Form

Fill out all sections:
- Tester information
- Overall rating
- System-specific ratings
- Bug reports
- Favorite mechanics
- Improvement suggestions

### Thank You!

Your feedback helps improve SPACE STRIKE for future players!

---

**Happy Testing, Pilot! o7**
