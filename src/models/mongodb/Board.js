const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  background: {
    type: String,
    default: '#0079bf'
  },
  is_starred: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  members: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member', 'viewer'],
      default: 'member'
    },
    added_at: {
      type: Date,
      default: Date.now
    }
  }]
});

// Update the updated_at timestamp before saving
boardSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Static methods to match the SQLite model
boardSchema.statics.findByUser = async function(userId) {
  return this.find({
    $or: [
      { owner_id: userId },
      { 'members.user_id': userId }
    ]
  }).sort({ is_starred: -1, created_at: -1 });
};

boardSchema.statics.checkAccess = async function(boardId, userId) {
  const board = await this.findById(boardId);
  if (!board) return false;
  
  // Owner has access
  if (board.owner_id.toString() === userId.toString()) return true;
  
  // Check if user is a member
  return board.members.some(member => member.user_id.toString() === userId.toString());
};

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
