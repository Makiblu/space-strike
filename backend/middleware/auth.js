// Authentication middleware

function requireAuth(req, res, next) {
  console.log('=== AUTH CHECK ===');
  console.log('Session exists:', !!req.session);
  console.log('Session ID:', req.session?.id);
  console.log('User ID:', req.session?.userId);
  console.log('Cookies:', req.headers.cookie);
  
  if (req.session && req.session.userId) {
    console.log('✅ Authenticated - User ID:', req.session.userId);
    return next();
  }
  
  console.log('❌ Not authenticated - Returning 401');
  return res.status(401).json({ 
    error: 'Unauthorized',
    message: 'You must be logged in to access this resource'
  });
}

function optionalAuth(req, res, next) {
  // Allows both authenticated and unauthenticated requests
  // Sets req.userId if authenticated
  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
