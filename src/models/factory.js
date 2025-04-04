// Model factory to choose between SQLite and MongoDB models
require('dotenv').config();

// SQLite models
const SQLiteUser = require('./User');
const SQLiteBoard = require('./Board');
const SQLiteList = require('./List');
const SQLiteCard = require('./Card');

// MongoDB models
const MongoDBModels = require('./mongodb');

// Check if MongoDB is enabled
let isMongoDBEnabled = false;
let mongoDBAvailable = false;

// Function to set MongoDB availability
const setMongoDBAvailable = (available) => {
  mongoDBAvailable = available;
};

// Function to get appropriate models based on configuration
const getModels = () => {
  // Check if MongoDB is enabled in the environment and available
  isMongoDBEnabled = process.env.USE_MONGODB === 'true';
  
  // Use MongoDB models if enabled and available
  if (isMongoDBEnabled && mongoDBAvailable) {
    return {
      User: MongoDBModels.User,
      Board: MongoDBModels.Board,
      List: MongoDBModels.List,
      Card: MongoDBModels.Card,
      isMongoDB: true
    };
  }
  
  // Otherwise use SQLite models
  return {
    User: SQLiteUser,
    Board: SQLiteBoard,
    List: SQLiteList,
    Card: SQLiteCard,
    isMongoDB: false
  };
};

module.exports = {
  getModels,
  setMongoDBAvailable
};
