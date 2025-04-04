require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const { connectMongoDB } = require('./config/mongodb');

// Try to connect to MongoDB if it's configured
if (process.env.MONGODB_URI) {
  connectMongoDB()
    .then(connected => {
      if (connected) {
        console.log('MongoDB is available and connected');
      } else {
        console.log('Continuing with SQLite only');
      }
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
      console.log('Continuing with SQLite only');
    });
} else {
  console.log('No MongoDB URI found, using SQLite only');
}

// Import routes
const authRoutes = require('./routes/auth');
const boardRoutes = require('./routes/boards');
const listRoutes = require('./routes/lists');
const cardRoutes = require('./routes/cards');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4567;
const BASE_PATH = process.env.BASE_PATH || '';

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow any origin in development, or specific origins in production
    if (process.env.NODE_ENV !== 'production' || !origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      'http://140.245.58.185',
      'https://140.245.58.185',
      'http://localhost:4567'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(morgan('dev')); // Logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Define the base path prefix for API
const apiBasePath = BASE_PATH ? `${BASE_PATH}/api` : '/api';

// Serve static files from the public directory with the BASE_PATH prefix
if (BASE_PATH) {
  app.use(BASE_PATH, express.static(path.join(__dirname, 'public')));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

// API routes with BASE_PATH
app.use(`${apiBasePath}/auth`, authRoutes);
app.use(`${apiBasePath}/boards`, boardRoutes);
app.use(`${apiBasePath}/lists`, listRoutes);
app.use(`${apiBasePath}/cards`, cardRoutes);

// Redirect root to BASE_PATH if BASE_PATH is set
if (BASE_PATH) {
  app.get('/', (req, res) => {
    res.redirect(BASE_PATH);
  });
}

// Handle specific HTML page routes
const htmlPages = ['login.html', 'register.html', 'boards.html', 'board.html'];

htmlPages.forEach(page => {
  const routePath = BASE_PATH ? `${BASE_PATH}/${page}` : `/${page}`;
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', page));
  });
});

// Handle root path
app.get(BASE_PATH || '/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle any other path as potential static file or default to index.html
app.use((req, res, next) => {
  // Extract the path relative to BASE_PATH
  let requestPath = req.path;
  
  // If using BASE_PATH, remove it from the request path
  if (BASE_PATH && requestPath.startsWith(BASE_PATH)) {
    requestPath = requestPath.substring(BASE_PATH.length);
  }
  
  // Check if file exists in public directory
  const filePath = path.join(__dirname, 'public', requestPath);
  
  try {
    // Check if file exists and is readable
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      return res.sendFile(filePath);
    }
  } catch (error) {
    console.error('Error checking file existence:', error);
  }
  
  // Default to index.html for client-side routing
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Server error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}${BASE_PATH}`);
  console.log(`Production URL: http://140.245.58.185${BASE_PATH} (when deployed)`);
});