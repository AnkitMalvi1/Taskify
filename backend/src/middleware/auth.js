const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Remove Bearer prefix if it exists
    const token = req.header('Authorization')?.replace('Bearer ', '') || '';
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'a1n5k2');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = auth;