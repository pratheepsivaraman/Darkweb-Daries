const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Trust proxy for rate limiting on Vercel
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all requests for now, including from missing origins (like mobile apps/postman)
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection logic
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    // In serverless, we don't want to exit the process, just throw and let the handler deal with it
    throw error;
  }
};

// Routes
const authRoutes = require('./routes/authRoutes');
const levelRoutes = require('./routes/levelRoutes');
const adminRoutes = require('./routes/adminRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({ status: 'ok', message: 'Project Dark API is running' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Middleware to ensure DB connection for all API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Root route for API
app.get('/', (req, res) => {
  res.send('Dark Web Diaries API is running....');
});

// Export the app for Vercel
module.exports = app;

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
