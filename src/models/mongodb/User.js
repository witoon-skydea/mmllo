const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updated_at timestamp before saving
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to validate password
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Static method to find by username
userSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
