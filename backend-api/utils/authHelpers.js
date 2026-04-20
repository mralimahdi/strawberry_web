const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function getUserFromToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  if (!token) return null;

  // Support JWT tokens when available
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded && decoded.userId) {
      return await User.findById(decoded.userId);
    }
    if (decoded && decoded.email) {
      return await User.findOne({ email: decoded.email.toLowerCase() });
    }
  } catch (error) {
    // token is not JWT or invalid, continue with simple format
  }

  // Support simple token values like email or email:role
  const rawToken = token.split(':')[0].toLowerCase();
  if (!rawToken.includes('@')) return null;
  return await User.findOne({ email: rawToken });
}

async function requireCustomer(req, res, next) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Only customers can perform this action.' });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Customer auth error:', error);
    res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

async function rejectAdminIfLoggedIn(req, res, next) {
  try {
    const user = await getUserFromToken(req);
    if (user && user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins cannot submit customer actions.' });
    }
    req.user = user || null;
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    res.status(500).json({ success: false, message: 'Authorization error.' });
  }
}

module.exports = {
  getUserFromToken,
  requireCustomer,
  rejectAdminIfLoggedIn
};