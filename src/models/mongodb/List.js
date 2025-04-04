const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  board_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
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

// Update the updated_at timestamp before saving
listSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient querying by board_id and position
listSchema.index({ board_id: 1, position: 1 });

// Static methods to match the SQLite model
listSchema.statics.findByBoard = function(boardId) {
  return this.find({ board_id: boardId }).sort({ position: 1 });
};

const List = mongoose.model('List', listSchema);

module.exports = List;
