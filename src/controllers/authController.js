const jwt = require('jsonwebtoken');
const { getModels } = require('../models/factory');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new user
const register = async (req, res) => {
  try {
    const { User } = getModels();
    const { username, email, password } = req.body;
    
    // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    
    // Check if user already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Create user
    const newUser = await User.create({ username, email, password });
    
    // Generate token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Send response
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// Login a user
const login = async (req, res) => {
  try {
    const { User } = getModels();
    const { username, password } = req.body;
    
    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await User.validatePassword(user, password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Send response
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Logout a user
const logout = (req, res) => {
  // Clear the cookie
  res.clearCookie('token');
  
  // Send response
  res.status(200).json({ message: 'Logout successful' });
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const { User } = getModels();
    const userId = req.user.id;
    
    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Send response
    res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error while fetching user' });
  }
};

module.exports = { register, login, logout, getCurrentUser };
