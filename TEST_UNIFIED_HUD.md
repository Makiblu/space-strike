# 🧪 UNIFIED HUD - TEST GUIDE

## Quick Test Procedure

### 1. Open the Game
```
Open: index.html in your browser
```

### 2. Visual Check (Main Menu)
Look at the page - the scattered HUD elements should be GONE from the main menu.

### 3. Start Quick Play
1. Login with any username
2. Click "QUICK PLAY"
3. Game starts immediately

### 4. Verify Unified HUD Header

**You should see ONE header bar at the top with:**

**TOP ROW (separated by thin line):**
- HEALTH (green bar + number)
- TARGETS (🎯 + number starting at 0)
- SCORE (⭐ + number starting at 0)
- TIME (⏱️ + 00:00)

**BOTTOM ROW:**
- MISSILES (🚀 + 3)
- ABILITY (⚡ + READY)
- FIGHTER (✈️ + FALCON or your selected fighter)

### 5. Test Health System

**Take damage from asteroids or enemies:**
- Health bar should shrink
- Number should decrease
- **At ~60% health:** Bar should turn ORANGE
- **At ~30% health:** Bar should turn RED
- Value should match bar width

### 6. Test Combat Counters

**Destroy enemies:**
- TARGETS counter should increment (+1 each)
- SCORE should increase
- TIME should count up (00:01, 00:02, etc.)

**Press ESC to pause:**
- TIME should stop counting
- HUD should remain visible behind pause menu

**Resume:**
- TIME continues from where it stopped

### 7. Test Boss System

**Destroy 20 enemies:**
- After the 20th enemy is destroyed
- Wait 2 seconds
- **BOSS section should appear** in the top row (right side)
- Should show: "ASTEROID KING" label
- Should show: Red health bar (full)

**Damage the boss:**
- Red health bar should decrease
- Bar should be smooth and responsive

**Defeat the boss:**
- Boss section should disappear or hide

### 8. Test Ability System

**Press Q (or E, depending on fighter):**
- "READY" should change to "ACTIVE" (orange, pulsing)
- Thin progress bar should appear below ability section

**Wait for ability to end:**
- Status changes to cooldown timer: "5s", "4s", "3s", etc.
- Progress bar fills from left to right
- When cooldown complete: Returns to "READY" (green)

### 9. Test Missiles

**Press SPACE or click to shoot:**
- Regular shots don't use missiles

**Press E (if your fighter has missiles):**
- MISSILES count should decrease
- Should never go below 0

### 10. Test Responsive Design

**Resize browser window:**
- Make it narrower
- HUD should stay at top
- Sections should wrap if needed
- Text should remain readable
- No horizontal scrolling

---

## Expected Results

### ✅ PASS Criteria

**Visual:**
- [ ] One unified header at top of screen
- [ ] Dark transparent background visible
- [ ] Cyan/teal border around header
- [ ] Two rows clearly separated
- [ ] All text readable and aligned
- [ ] No overlapping elements

**Health:**
- [ ] Bar updates when taking damage
- [ ] Number matches bar width
- [ ] Color changes: Green → Orange → Red
- [ ] No negative values
- [ ] No exceeding 100%

**Counters:**
- [ ] Targets increment on enemy death
- [ ] Score updates continuously
- [ ] Time counts in MM:SS format
- [ ] Time pauses when game paused

**Boss:**
- [ ] Appears after 20 targets
- [ ] Shows correct boss name
- [ ] Health bar decreases with damage
- [ ] Hides when boss defeated
- [ ] Never shows fake stuck values

**Ability:**
- [ ] Shows READY initially
- [ ] Changes to ACTIVE when used
- [ ] Shows cooldown timer with countdown
- [ ] Progress bar animates smoothly
- [ ] Returns to READY after cooldown

**Missiles:**
- [ ] Decrements when launched
- [ ] Never goes negative
- [ ] Count visible and accurate

**Fighter:**
- [ ] Shows selected fighter name
- [ ] Updates if fighter changed in hangar

**Responsive:**
- [ ] Scales with window resize
- [ ] Wraps sections on small screens
- [ ] No layout breaking
- [ ] Text remains readable

---

## Common Issues & Solutions

### Issue: HUD not showing
**Check:** Did the game start? Press ESC to unpause if stuck.

### Issue: Old scattered HUD elements visible
**Fix:** Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

### Issue: Boss health not appearing
**Check:** Did you destroy exactly 20 enemies? Count should show in TARGETS.

### Issue: Health not changing color
**Check:** Are you actually taking damage? Health must drop below thresholds.

### Issue: Timer not moving
**Check:** Is game paused? Press ESC to resume.

### Issue: Ability cooldown not showing
**Check:** Did you activate the ability? Press Q or E key.

---

## Performance Check

**During intense combat (many enemies + asteroids):**
- [ ] HUD updates smoothly
- [ ] No lag or stuttering
- [ ] Bars animate without jank
- [ ] Text remains crisp

**Target FPS:** 60 FPS maintained

---

## Screenshot Checklist

If taking screenshots for documentation:

1. **Initial state** - Full HUD with game just started
2. **High health** - Health bar green, full
3. **Medium health** - Health bar orange, ~50%
4. **Low health** - Health bar red, <30%
5. **Boss active** - Boss section visible with name
6. **Ability ready** - "READY" in green
7. **Ability active** - "ACTIVE" in orange, pulsing
8. **Ability cooldown** - Timer countdown with progress bar
9. **Pause state** - HUD visible behind pause menu
10. **Responsive** - Small window with wrapped sections

---

## Bug Report Template

If you find issues, report with:

```
ISSUE: [Brief description]
EXPECTED: [What should happen]
ACTUAL: [What actually happens]
STEPS:
1. [Step to reproduce]
2. [Step to reproduce]
3. [Step to reproduce]
SCREENSHOT: [If possible]
BROWSER: [Chrome/Firefox/Safari/Edge]
```

---

## Final Checklist

Before declaring test complete:

- [ ] All HUD sections visible in one header
- [ ] Health updates correctly
- [ ] Targets and score update
- [ ] Timer works (counts, pauses, resumes)
- [ ] Boss appears and updates correctly
- [ ] Missiles decrement properly
- [ ] Ability states work (READY/ACTIVE/cooldown)
- [ ] Cooldown progress bar animates
- [ ] Fighter name displays
- [ ] No gameplay features broken
- [ ] Pause/restart work correctly
- [ ] Responsive to window resize
- [ ] No console errors
- [ ] No visual glitches

---

## Success!

If all tests pass, the unified HUD header is working correctly! 🎉

**Next:** Play a full game and enjoy the improved interface!

---

**Test Date:** _____________  
**Tester:** _____________  
**Browser:** _____________  
**Result:** ☐ PASS  ☐ FAIL  
**Notes:** _____________________________________________
