const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

// Helmet configuration for security headers
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});

// Rate limiting configuration
const limiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

const limiter = rateLimit(limiterOptions);

// Stricter rate limiting for authentication endpoints
const authLimiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
};

const authLimiter = rateLimit(authLimiterOptions);

// Rate limiting for transaction creation
const transactionLimiterOptions = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 transactions per hour
  message: 'Too many transactions created, please try again later.',
};

const transactionLimiter = rateLimit(transactionLimiterOptions);

// Rate limiting for payment endpoints
const paymentLimiterOptions = {
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 payment requests per minute
  message: 'Too many payment requests, please try again later.',
};

const paymentLimiter = rateLimit(paymentLimiterOptions);

// Sanitize data to prevent MongoDB operator injection
const sanitize = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized request data at key: ${key}`);
  },
});

module.exports = {
  helmetConfig,
  limiter,
  authLimiter,
  transactionLimiter,
  paymentLimiter,
  sanitize,
  // Export options for testing
  limiterOptions,
  authLimiterOptions,
  transactionLimiterOptions,
  paymentLimiterOptions
};
