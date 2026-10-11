// SPACE STRIKE - Mobile Responsive Handler
// Handles mobile-specific features without affecting desktop

const MobileResponsive = {
    isMobile: false,
    isLandscape: false,
    orientationWarning: null,
    
    init() {
        // Detect if device is mobile
        this.isMobile = this.detectMobile();
        
        if (this.isMobile) {
            console.log('📱 Mobile device detected');
            this.setupMobileFeatures();
            this.checkOrientation();
            this.addOrientationListener();
        } else {
            console.log('🖥️ Desktop device detected');
        }
    },
    
    detectMobile() {
        // Check multiple indicators for mobile device
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const isSmallScreen = window.innerWidth <= 768;
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        
        return isTouchDevice && (isSmallScreen || mobileRegex.test(userAgent));
    },
    
    setupMobileFeatures() {
        // Add mobile-specific CSS class to body
        document.body.classList.add('mobile-device');
        
        // Create orientation warning overlay
        this.createOrientationWarning();
        
        // Ensure mobile controls are visible
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.classList.remove('hidden');
        }
        
        // Add mobile pause button to game screen
        this.addMobilePauseButton();
        
        // Optimize touch events
        this.optimizeTouchEvents();
    },
    
    createOrientationWarning() {
        // Create overlay for orientation warning
        const overlay = document.createElement('div');
        overlay.id = 'orientationWarning';
        overlay.className = 'orientation-warning hidden';
        overlay.innerHTML = `
            <div class="orientation-content">
                <div class="rotate-icon">📱 ↻</div>
                <h2>Please rotate your device to landscape mode for the best experience</h2>
                <p>This game is optimized for horizontal gameplay</p>
            </div>
        `;
        document.body.appendChild(overlay);
        this.orientationWarning = overlay;
    },
    
    addMobilePauseButton() {
        // Add pause button to game HUD (only visible on mobile during gameplay)
        const hudElement = document.querySelector('.hud-header');
        if (hudElement && !document.getElementById('mobilePauseButtonTop')) {
            const pauseBtn = document.createElement('button');
            pauseBtn.id = 'mobilePauseButtonTop';
            pauseBtn.className = 'mobile-pause-btn-top';
            pauseBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor" style="width:24px;height:24px">
                    <rect x="6" y="4" width="4" height="16"/>
                    <rect x="14" y="4" width="4" height="16"/>
                </svg>
            `;
            pauseBtn.addEventListener('click', () => {
                if (typeof pauseGame === 'function') {
                    pauseGame();
                }
            });
            hudElement.appendChild(pauseBtn);
        }
    },
    
    checkOrientation() {
        // Check if device is in landscape mode
        const isLandscape = window.innerWidth > window.innerHeight;
        const isPortrait = window.innerHeight > window.innerWidth;
        
        this.isLandscape = isLandscape;
        
        if (this.isMobile && this.orientationWarning) {
            // Show warning only in menus or during gameplay in portrait mode
            const isInGame = document.getElementById('gameScreen') && 
                            !document.getElementById('gameScreen').classList.contains('hidden');
            const isInMenu = document.getElementById('mainMenu') && 
                            !document.getElementById('mainMenu').classList.contains('hidden');
            
            if (isPortrait && (isInGame || isInMenu)) {
                this.orientationWarning.classList.remove('hidden');
            } else {
                this.orientationWarning.classList.add('hidden');
            }
        }
    },
    
    addOrientationListener() {
        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.checkOrientation(), 100);
        });
        
        window.addEventListener('resize', () => {
            this.checkOrientation();
        });
        
        // Check orientation periodically during gameplay
        setInterval(() => {
            if (this.isMobile) {
                this.checkOrientation();
            }
        }, 1000);
    },
    
    optimizeTouchEvents() {
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent pinch zoom
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MobileResponsive.init();
    });
} else {
    MobileResponsive.init();
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    window.MobileResponsive = MobileResponsive;
}
