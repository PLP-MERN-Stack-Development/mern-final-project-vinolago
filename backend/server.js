const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

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

// CORS Middleware - Properly configured for Vercel + localhost
const getAllowedOrigins = () => {
  // Environment variable takes precedence (comma-separated for production)
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  
  // Default development origins
  const devOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:8080',
    'http://localhost:8081',
  ];
  
  // In production, add common Vercel domains
  if (process.env.NODE_ENV === 'production') {
    devOrigins.push(
      /\.vercel\.app$/,
      'https://your-frontend-vercel-url.vercel.app'
    );
  }
  
  return devOrigins;
};

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin) ||
        allowedOrigins.some(pattern => pattern instanceof RegExp && pattern.test(origin))) {
      return callback(null, true);
    }
    
    // For development, allow all origins if no ALLOWED_ORIGINS is set
    if (!process.env.ALLOWED_ORIGINS && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
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

// Enhanced Health Check routes for Render deployment
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Escrow App API',
    version: '1.0.0',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    api: 'Escrow App API',
    version: '1.0.0'
  });
});

// Root route - API only, no static files
app.get('/', (req, res) => {
  res.json({
    message: 'Escrow App API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      apiHealth: '/api/health',
      auth: '/api/auth',
      transactions: '/api/transactions',
      users: '/api/users',
      payments: '/api/payments',
      admin: '/api/admin'
    }
  });
});

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'Escrow App API Documentation',
    version: '1.0.0',
    endpoints: {
      authentication: {
        'POST /api/auth/login': 'User login',
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/logout': 'User logout',
        'POST /api/auth/forgot-password': 'Password reset request',
        'POST /api/auth/reset-password': 'Reset password with token'
      },
      transactions: {
        'GET /api/transactions': 'Get all transactions',
        'GET /api/transactions/:id': 'Get transaction by ID',
        'POST /api/transactions': 'Create new transaction',
        'PUT /api/transactions/:id': 'Update transaction',
        'DELETE /api/transactions/:id': 'Delete transaction'
      },
      users: {
        'GET /api/users/profile': 'Get user profile',
        'PUT /api/users/profile': 'Update user profile',
        'GET /api/users': 'Get all users (admin)',
        'PUT /api/users/:id/role': 'Update user role (admin)'
      },
      payments: {
        'POST /api/payments/initiate/:transactionId': 'Initiate payment',
        'GET /api/payments/status/:paymentId': 'Check payment status',
        'POST /api/payments/callback': 'Payment callback (M-Pesa)'
      },
      admin: {
        'GET /api/admin/dashboard': 'Dashboard statistics',
        'GET /api/admin/transactions': 'All transactions (admin)',
        'GET /api/admin/users': 'All users (admin)',
        'GET /api/admin/payouts': 'Payout management',
        'POST /api/admin/payouts/process': 'Process payout'
      }
    }
  });
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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;