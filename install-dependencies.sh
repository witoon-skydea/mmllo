#!/bin/bash

# MMLLO Dependency Installation Script
echo "Installing MMLLO dependencies..."

# Install npm dependencies
npm install

# Install additional dev dependencies
npm install --save-dev cross-env

echo "Dependencies installed successfully!"
echo ""
echo "You can now start the application using one of the following commands:"
echo "- npm start               (Production mode with SQLite)"
echo "- npm run dev             (Development mode with SQLite)"
echo "- npm run use-sqlite      (Development mode with SQLite)"
echo "- npm run use-mongodb     (Development mode with MongoDB)"
echo ""
echo "Make sure to set up your .env file with the appropriate configuration."
