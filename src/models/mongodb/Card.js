const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  list_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  due_date: {
    type: Date
  },
  labels: {
    type: [String],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  comments: [{
    content: {
      type: String,
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
  }]
});

// Update the updated_at timestamp before saving
cardSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient querying by list_id and position
cardSchema.index({ list_id: 1, position: 1 });

// Static methods to match the SQLite model
cardSchema.statics.findByList = function(listId) {
  return this.find({ list_id: listId }).sort({ position: 1 });
};

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
