/**
 * Database utility functions for handling both SQLite and MongoDB
 */
const { getModels } = require('../models/factory');

/**
 * Convert MongoDB document to plain object with normalized IDs
 * @param {Object} doc - MongoDB document
 * @returns {Object} - Plain object with normalized IDs
 */
function normalizeDocument(doc) {
  if (!doc) return null;
  
  // If not a MongoDB document, return as is
  if (!doc.toObject && !doc._id) return doc;
  
  // Convert MongoDB document to plain object
  const plainObj = doc.toObject ? doc.toObject() : { ...doc };
  
  // Convert _id to id
  if (plainObj._id) {
    plainObj.id = plainObj._id.toString();
    delete plainObj._id;
  }
  
  // Remove MongoDB __v field
  if (plainObj.__v !== undefined) {
    delete plainObj.__v;
  }
  
  return plainObj;
}

/**
 * Normalize an array of MongoDB documents or a single document
 * @param {Array|Object} docs - MongoDB documents
 * @returns {Array|Object} - Normalized documents
 */
function normalizeDocuments(docs) {
  if (Array.isArray(docs)) {
    return docs.map(normalizeDocument);
  }
  return normalizeDocument(docs);
}

/**
 * Get the appropriate ID based on the database type
 * @param {string|number} id - The ID to process
 * @returns {string|number} - Processed ID
 */
function getDbId(id) {
  const { isMongoDB } = getModels();
  
  // For MongoDB, ensure ID is a string
  if (isMongoDB) {
    return typeof id === 'object' ? id.toString() : id;
  }
  
  // For SQLite, ensure ID is a number
  return typeof id === 'string' ? parseInt(id) : id;
}

module.exports = {
  normalizeDocument,
  normalizeDocuments,
  getDbId
};
