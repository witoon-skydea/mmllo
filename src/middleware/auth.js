const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header or cookie
  const authHeader = req.headers['authorization'];
  const cookieToken = req.cookies?.token;
  const token = authHeader?.split(' ')[1] || cookieToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    // Convert MongoDB ObjectID to string for consistency
    if (verified && verified.id && typeof verified.id === 'object' && verified.id.toString) {
      verified.id = verified.id.toString();
    }
    req.user = verified;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

module.exports = { authenticateToken };
