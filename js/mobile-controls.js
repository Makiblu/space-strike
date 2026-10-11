// SPACE STRIKE - Mobile Controls
// Virtual joystick and touch controls for mobile devices

(function() {
    'use strict';
    
    // Check if device is touch-enabled
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (!isTouchDevice) {
        return; // Exit if not a touch device
    }
    
    // Mobile control state
    const mobileState = {
        joystick: {
            active: false,
            touchId: null,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            deltaX: 0,
            deltaY: 0
        },
        buttons: {
            fire: false,
            missile: false,
            ability: false
        }
    };
    
    // Get elements
    const mobileControls = document.getElementById('mobileControls');
    const joystickContainer = document.getElementById('joystickContainer');
    const joystickStick = document.getElementById('joystickStick');
    const fireBtn = document.getElementById('mobileFireBtn');
    const missileBtn = document.getElementById('mobileMissileBtn');
    const abilityBtn = document.getElementById('mobileAbilityBtn');
    const pauseBtn = document.getElementById('mobilePauseBtn');
    
    // Show mobile controls on game screen
    function showMobileControls() {
        mobileControls.classList.remove('hidden');
    }
    
    function hideMobileControls() {
        mobileControls.classList.add('hidden');
        resetJoystick();
    }
    
    // Initialize mobile controls
    function initMobileControls() {
        // Show controls when game starts
        const originalStartGame = window.startGame;
        window.startGame = function(...args) {
            originalStartGame.apply(this, args);
            showMobileControls();
        };
        
        // Hide controls on game over/pause
        const originalGameOver = window.gameOver;
        window.gameOver = function(...args) {
            originalGameOver.apply(this, args);
            hideMobileControls();
        };
        
        const originalPauseGame = window.pauseGame;
        window.pauseGame = function(...args) {
            originalPauseGame.apply(this, args);
            hideMobileControls();
        };
        
        const originalResumeGame = window.resumeGame;
        window.resumeGame = function(...args) {
            originalResumeGame.apply(this, args);
            showMobileControls();
        };
        
        setupJoystick();
        setupButtons();
    }
    
    // Setup Virtual Joystick
    function setupJoystick() {
        const maxDistance = 40; // Maximum joystick displacement
        
        joystickContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = joystickContainer.getBoundingClientRect();
            
            mobileState.joystick.active = true;
            mobileState.joystick.touchId = touch.identifier;
            mobileState.joystick.startX = rect.left + rect.width / 2;
            mobileState.joystick.startY = rect.top + rect.height / 2;
            
            updateJoystick(touch.clientX, touch.clientY, maxDistance);
        });
        
        joystickContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!mobileState.joystick.active) return;
            
            const touch = Array.from(e.touches).find(t => t.identifier === mobileState.joystick.touchId);
            if (!touch) return;
            
            updateJoystick(touch.clientX, touch.clientY, maxDistance);
        });
        
        joystickContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            resetJoystick();
        });
        
        joystickContainer.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            resetJoystick();
        });
    }
    
    function updateJoystick(touchX, touchY, maxDistance) {
        const deltaX = touchX - mobileState.joystick.startX;
        const deltaY = touchY - mobileState.joystick.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > maxDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            mobileState.joystick.deltaX = Math.cos(angle) * maxDistance;
            mobileState.joystick.deltaY = Math.sin(angle) * maxDistance;
        } else {
            mobileState.joystick.deltaX = deltaX;
            mobileState.joystick.deltaY = deltaY;
        }
        
        // Update stick position
        joystickStick.style.transform = `translate(calc(-50% + ${mobileState.joystick.deltaX}px), calc(-50% + ${mobileState.joystick.deltaY}px))`;
        
        // Normalize values (-1 to 1)
        mobileState.joystick.currentX = mobileState.joystick.deltaX / maxDistance;
        mobileState.joystick.currentY = mobileState.joystick.deltaY / maxDistance;
    }
    
    function resetJoystick() {
        mobileState.joystick.active = false;
        mobileState.joystick.touchId = null;
        mobileState.joystick.deltaX = 0;
        mobileState.joystick.deltaY = 0;
        mobileState.joystick.currentX = 0;
        mobileState.joystick.currentY = 0;
        joystickStick.style.transform = 'translate(-50%, -50%)';
    }
    
    // Setup Action Buttons
    function setupButtons() {
        // Fire Button (continuous fire while held)
        fireBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileState.buttons.fire = true;
            fireBtn.style.transform = 'scale(0.9)';
        });
        
        fireBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileState.buttons.fire = false;
            fireBtn.style.transform = 'scale(1)';
        });
        
        fireBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            mobileState.buttons.fire = false;
            fireBtn.style.transform = 'scale(1)';
        });
        
        // Missile Button (single tap)
        missileBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileState.buttons.missile = true;
            missileBtn.style.transform = 'scale(0.9)';
            
            // Fire missile
            if (window.fireMissile) {
                window.fireMissile();
            }
        });
        
        missileBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileState.buttons.missile = false;
            missileBtn.style.transform = 'scale(1)';
        });
        
        missileBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            mobileState.buttons.missile = false;
            missileBtn.style.transform = 'scale(1)';
        });
        
        // Ability Button (single tap)
        abilityBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mobileState.buttons.ability = true;
            abilityBtn.style.transform = 'scale(0.9)';
            
            // Activate ability
            if (window.activateAbility) {
                window.activateAbility();
            }
        });
        
        abilityBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            mobileState.buttons.ability = false;
            abilityBtn.style.transform = 'scale(1)';
        });
        
        abilityBtn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            mobileState.buttons.ability = false;
            abilityBtn.style.transform = 'scale(1)';
        });
        
        // Pause Button
        pauseBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pauseBtn.style.transform = 'scale(0.9)';
            
            if (window.pauseGame && window.currentState === window.GameState.PLAYING) {
                window.pauseGame();
            }
        });
        
        pauseBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            pauseBtn.style.transform = 'scale(1)';
        });
    }
    
    // Export mobile state for game to read
    window.mobileControls = {
        isActive: () => isTouchDevice,
        getJoystick: () => ({
            x: mobileState.joystick.currentX,
            y: mobileState.joystick.currentY,
            active: mobileState.joystick.active
        }),
        isFirePressed: () => mobileState.buttons.fire,
        isMissilePressed: () => mobileState.buttons.missile,
        isAbilityPressed: () => mobileState.buttons.ability
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileControls);
    } else {
        initMobileControls();
    }
    
})();
