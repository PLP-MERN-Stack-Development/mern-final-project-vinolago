const clerk = require('../config/clerk');
const User = require('../models/User');

// Middleware to verify Clerk JWT tokens
const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token with Clerk
    const payload = await clerk.verifyToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user details from Clerk
    const clerkUser = await clerk.users.getUser(payload.sub);

    // Get user from database to include role information
    let user = await User.findOne({ clerkId: payload.sub });

    if (!user) {
      // Auto-sync user if not found
      user = new User({
        clerkId: payload.sub,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        firstName: clerkUser.firstName || '',
        lastName: clerkUser.lastName || '',
        phoneNumber: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
        role: 'buyer' // Default role
      });
      await user.save();
    }

    // Add user info to request
    req.user = {
      clerkId: payload.sub,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      firstName: clerkUser.firstName || '',
      lastName: clerkUser.lastName || '',
      phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
      role: user.role,
      isAdmin: user.role === 'admin'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const payload = await clerk.verifyToken(token);
      if (payload) {
        // Fetch user details from Clerk
        const clerkUser = await clerk.users.getUser(payload.sub);

        // Get user from database to include role information
        const user = await User.findOne({ clerkId: payload.sub });

        req.user = {
          clerkId: payload.sub,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
          role: user?.role || 'buyer',
          isAdmin: user?.role === 'admin'
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth
};