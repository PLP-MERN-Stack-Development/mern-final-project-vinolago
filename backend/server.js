const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const { initializeSocket } = require('./utils/socket');
const io = initializeSocket(server);

// Make io accessible to routes
app.set('io', io);

// Import middleware
const { combinedLogger, errorLogger } = require('./middleware/logger');
const { helmetConfig, limiter, sanitize } = require('./middleware/security');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Security Middleware
app.use(helmetConfig);
app.use(sanitize);
app.use(limiter);

// Logging Middleware
app.use(combinedLogger);

// CORS Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split('||').map(s => s.trim()) : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/escrow-app')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const mpesaRoutes = require('./routes/mpesaRoutes');
const adminRoutes = require('./routes/adminRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', mpesaRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Escrow App API', version: '1.0.0' });
});

// Test routes for integration testing (only in test environment)
if (process.env.NODE_ENV === 'test' || process.env.TESTING === 'true') {
  app.post('/api/test-post', (req, res) => {
    res.status(201).json({ success: true });
  });

  app.put('/api/test-put', (req, res) => {
    res.json({ success: true });
  });

  app.delete('/api/test-delete', (req, res) => {
    res.status(204).send();
  });

  app.post('/api/test-json', (req, res) => {
    res.json({ received: req.body });
  });

  app.post('/api/test-urlencoded', (req, res) => {
    res.json({ received: req.body });
  });

  app.post('/api/test-sanitize', (req, res) => {
    res.json({ received: req.body });
  });
}

// 404 handler - must be after all routes
app.use(notFound);

// Error logging middleware
app.use(errorLogger);

// Error handling middleware - must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io server ready for connections`);
});

module.exports = { app, server, io };