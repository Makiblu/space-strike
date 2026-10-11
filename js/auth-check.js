/**
 * Authentication checker for SPACE STRIKE
 * Checks if user is logged in via backend session
 * Now uses Config for environment-aware API URLs
 */

// Check authentication status on page load
async function checkAuth() {
    try {
        const response = await Config.fetch(Config.endpoints.status, {
            method: 'GET'
        });

        const data = await response.json();

        if (data.authenticated) {
            console.log('User authenticated:', data.username);
            return {
                authenticated: true,
                userId: data.userId,
                username: data.username
            };
        } else {
            console.log('User not authenticated');
            return { authenticated: false };
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        return { authenticated: false };
    }
}

// Redirect to login if not authenticated
async function requireAuth() {
    const auth = await checkAuth();
    
    if (!auth.authenticated) {
        console.log('Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return null;
    }
    
    return auth;
}

// Logout function
async function logout() {
    try {
        await Config.fetch(Config.endpoints.logout, {
            method: 'POST'
        });
        
        // Clear local storage
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        
        // Redirect to login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect even if API fails
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('userId');
        window.location.href = 'login.html';
    }
}

