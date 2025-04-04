const mongoose = require('mongoose');
const { setMongoDBAvailable } = require('../models/factory');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const connectMongoDB = async () => {
  if (!MONGODB_URI) {
    console.log('No MongoDB URI found, skipping MongoDB connection');
    setMongoDBAvailable(false);
    return false;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');
    setMongoDBAvailable(true);
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    setMongoDBAvailable(false);
    return false;
  }
};

const disconnectMongoDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
    return false;
  }
};

module.exports = { connectMongoDB, disconnectMongoDB, mongoose };
