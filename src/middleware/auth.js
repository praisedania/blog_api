const jwt = require('jsonwebtoken');
const { User } = require('../../models');

/**
 * Middleware to authenticate JWT token and attach user
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Use a promise to handle the async database call
    User.findByPk(decoded.id).then(user => {
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user is suspended
      if (user.isSuspended) {
        return res.status(403).json({ message: 'Account suspended. Contact administrator.' });
      }

      req.user = user;
      next();
    }).catch(error => {
      return res.status(500).json({ message: 'Server error' });
    });
  });
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

/**
 * Middleware to require author role or higher
 */
const requireAuthor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== 'author' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Author access required' });
  }

  next();
};

/**
 * Middleware to require user role or higher (all authenticated users)
 */
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  next();
};

/**
 * Middleware to check if user owns the resource or is admin
 */
const requireOwnershipOrAdmin = (resourceUserId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // User can only access their own resources
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({ message: 'Access denied: not resource owner' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAuthor,
  requireUser
};