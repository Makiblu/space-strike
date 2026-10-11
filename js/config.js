// SPACE STRIKE - Configuration
// Handles environment-specific settings for local and production deployment

const Config = {
    // API Base URL - Automatically detects environment
    getApiUrl: function() {
        // Check if we're running on localhost
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
            // Local development
            return 'http://localhost:3000';
        } else {
            // Production - use same origin or environment variable
            // Option 1: Same origin (if backend is served from same domain)
            return window.location.origin;
            
            // Option 2: Specific production URL (uncomment and set your production URL)
            // return 'https://your-production-domain.com';
        }
    },
    
    // Get full API endpoint URL
    api: function(endpoint) {
        return `${this.getApiUrl()}/api${endpoint}`;
    },
    
    // API Endpoints
    endpoints: {
        // Auth
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        status: '/auth/status',
        
        // Game
        submitResult: '/game/result',
        gameHistory: '/game/history',
        leaderboard: '/game/leaderboard',
        playerRank: '/game/rank',
        
        // Player
        profile: '/player/profile',
        progress: '/player/progress',
        fighters: '/player/fighters',
        inventory: '/player/inventory',
        updateCoins: '/player/coins',
        
        // Health check
        health: '/health'
    },
    
    // Default fetch options
    fetchOptions: {
        credentials: 'include', // Always include cookies
        headers: {
            'Content-Type': 'application/json'
        }
    },
    
    // Helper method for API calls
    async fetch(endpoint, options = {}) {
        const url = this.api(endpoint);
        const mergedOptions = {
            ...this.fetchOptions,
            ...options,
            headers: {
                ...this.fetchOptions.headers,
                ...(options.headers || {})
            }
        };
        
        try {
            console.log(`🌐 API Request: ${mergedOptions.method || 'GET'} ${url}`);
            const response = await fetch(url, mergedOptions);
            
            if (!response.ok) {
                console.error(`❌ API Error: ${response.status} ${response.statusText}`);
            } else {
                console.log(`✅ API Success: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            console.error(`❌ Network Error:`, error);
            throw error;
        }
    },
    
    // Check if backend is available
    async checkBackendConnection() {
        try {
            const response = await this.fetch(this.endpoints.health, {
                method: 'GET'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Backend Connected:', data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Backend Connection Failed:', error.message);
            return false;
        }
    },
    
    // Environment info
    isDevelopment: function() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    },
    
    isProduction: function() {
        return !this.isDevelopment();
    },
    
    getEnvironment: function() {
        return this.isDevelopment() ? 'development' : 'production';
    }
};

// Log current configuration
console.log('🔧 SPACE STRIKE Configuration:');
console.log('   Environment:', Config.getEnvironment());
console.log('   API URL:', Config.getApiUrl());
console.log('   Hostname:', window.location.hostname);
