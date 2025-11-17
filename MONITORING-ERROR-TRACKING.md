# Monitoring & Error Tracking Setup

## 📊 Complete Monitoring Solution

This guide covers setting up comprehensive monitoring, error tracking, and alerting for your MERN escrow application.

---

## 🎯 Monitoring Strategy

### What to Monitor:

**Application Performance:**
- Response times
- Throughput (requests/sec)
- Error rates
- Database query performance

**Infrastructure:**
- CPU usage
- Memory usage
- Disk space
- Network traffic

**Business Metrics:**
- Active users
- Transactions per day
- Payment success rate
- User registration rate

---

## 🚨 Error Tracking - Sentry

### 1. Setup Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Create account or sign in
3. Create new project for backend (Node.js)
4. Create new project for frontend (React)

### 2. Backend Setup

```bash
cd backend
npm install @sentry/node @sentry/profiling-node
```

#### Create Sentry Configuration

**File: `backend/config/sentry.js`**
```javascript
const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Profiling
    profilesSampleRate: 1.0,
    
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      new ProfilingIntegration(),
    ],
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request) {
        delete event.request.headers.authorization;
        delete event.request.cookies;
      }
      
      // Remove passwords from data
      if (event.extra) {
        if (event.extra.password) delete event.extra.password;
        if (event.extra.confirmPassword) delete event.extra.confirmPassword;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'Non-Error promise rejection captured',
      'ResizeObserver loop limit exceeded',
    ],
  });
  
  return Sentry;
}

module.exports = { initSentry };
```

#### Update server.js

```javascript
const express = require('express');
const { initSentry } = require('./config/sentry');

const app = express();

// Initialize Sentry FIRST
const Sentry = initSentry(app);

// Request handler must be first middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... your other middleware and routes ...

// Error handler must be before other error middleware
app.use(Sentry.Handlers.errorHandler());

// Your custom error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

module.exports = app;
```

#### Add Environment Variable

```bash
# .env
SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxxxx
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install @sentry/react
```

#### Update main.jsx

**File: `frontend/src/main.jsx`**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';

// Initialize Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/your-api-domain\.com/,
      ],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance Monitoring
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of errors
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove passwords from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
        if (breadcrumb.data && breadcrumb.data.password) {
          delete breadcrumb.data.password;
        }
        return breadcrumb;
      });
    }
    return event;
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<div>An error occurred</div>}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
```

#### Create Error Boundary Component

**File: `frontend/src/components/ErrorBoundary.jsx`**
```javascript
import React from 'react';
import * as Sentry from '@sentry/react';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Oops! Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          We're sorry for the inconvenience. The error has been reported to our team.
        </p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-500">
            Error details
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

const ErrorBoundary = Sentry.withErrorBoundary(ErrorFallback);

export default ErrorBoundary;
```

#### Add to .env

```bash
VITE_SENTRY_DSN=https://xxxx@xxx.ingest.sentry.io/xxxxx
```

---

## 📈 Performance Monitoring - New Relic

### 1. Setup New Relic

```bash
cd backend
npm install newrelic
```

### 2. Create Configuration

**File: `backend/newrelic.js`**
```javascript
'use strict';

exports.config = {
  app_name: ['Escrow API'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  
  logging: {
    level: 'info',
    filepath: 'stdout',
  },
  
  // Allow all data to be sent
  allow_all_headers: true,
  
  // Attributes to capture
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*',
    ],
  },
  
  // Application logging
  application_logging: {
    forwarding: {
      enabled: true,
    },
  },
  
  // Distributed tracing
  distributed_tracing: {
    enabled: true,
  },
  
  // Error collection
  error_collector: {
    enabled: true,
    capture_events: true,
    max_event_samples_stored: 100,
  },
};
```

### 3. Update server.js

```javascript
// MUST BE FIRST LINE
require('newrelic');

const express = require('express');
// ... rest of your code
```

### 4. Add Environment Variable

```bash
NEW_RELIC_LICENSE_KEY=your-license-key
NEW_RELIC_APP_NAME=Escrow API
```

---

## 🔍 Logging - Winston (Already Implemented)

### Enhanced Configuration

**File: `backend/config/logger.js`**
```javascript
const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'escrow-api',
    environment: process.env.NODE_ENV 
  },
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Write errors to error.log
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/exceptions.log') 
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/rejections.log') 
    })
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Production: Send logs to external service
if (process.env.NODE_ENV === 'production') {
  // Loggly
  if (process.env.LOGGLY_TOKEN) {
    const { Loggly } = require('winston-loggly-bulk');
    logger.add(new Loggly({
      token: process.env.LOGGLY_TOKEN,
      subdomain: process.env.LOGGLY_SUBDOMAIN,
      tags: ['NodeJS', 'Escrow-API', process.env.NODE_ENV],
      json: true,
    }));
  }
  
  // Papertrail
  if (process.env.PAPERTRAIL_HOST) {
    require('winston-papertrail').Papertrail;
    logger.add(new winston.transports.Papertrail({
      host: process.env.PAPERTRAIL_HOST,
      port: process.env.PAPERTRAIL_PORT,
    }));
  }
}

module.exports = logger;
```

---

## ⏰ Uptime Monitoring

### Option 1: UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create account
3. Add monitors:

**Backend Health Check:**
- Monitor Type: HTTP(s)
- URL: `https://api.your-domain.com/health`
- Interval: 5 minutes
- Alert Contacts: Email, Slack, SMS

**Frontend:**
- Monitor Type: HTTP(s)
- URL: `https://your-domain.com`
- Interval: 5 minutes
- Keyword: Check for specific text on page

**Critical Endpoints:**
- `/api/transactions`
- `/api/auth/login`
- `/api/payments`

### Option 2: Pingdom

1. Sign up at [pingdom.com](https://www.pingdom.com)
2. Create uptime checks
3. Set up alerts
4. Configure response time monitoring

### Option 3: Better Uptime

1. Go to [betteruptime.com](https://betteruptime.com)
2. Add monitors
3. Configure incident management
4. Set up status page

---

## 📊 Application Performance Monitoring (APM)

### Datadog Setup

```bash
npm install dd-trace --save
```

**File: `backend/server.js`**
```javascript
// Initialize tracer FIRST
const tracer = require('dd-trace').init({
  service: 'escrow-api',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  logInjection: true,
});

// Rest of your application
const express = require('express');
// ...
```

---

## 🎯 Custom Metrics

### Backend Custom Metrics

**File: `backend/utils/metrics.js`**
```javascript
const promClient = require('prom-client');

// Create a Registry
const register = new promClient.Registry();

// Add default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const transactionCounter = new promClient.Counter({
  name: 'transactions_total',
  help: 'Total number of transactions',
  labelNames: ['status', 'type'],
});

const activeUsersGauge = new promClient.Gauge({
  name: 'active_users',
  help: 'Number of active users',
});

const paymentSuccessRate = new promClient.Gauge({
  name: 'payment_success_rate',
  help: 'Payment success rate percentage',
});

// Register metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(transactionCounter);
register.registerMetric(activeUsersGauge);
register.registerMetric(paymentSuccessRate);

// Middleware to track request duration
function trackHttpDuration(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode,
      },
      duration
    );
  });
  
  next();
}

// Expose metrics endpoint
function metricsEndpoint(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
}

module.exports = {
  register,
  httpRequestDuration,
  transactionCounter,
  activeUsersGauge,
  paymentSuccessRate,
  trackHttpDuration,
  metricsEndpoint,
};
```

**Add to server.js:**
```javascript
const { trackHttpDuration, metricsEndpoint } = require('./utils/metrics');

// Add metrics middleware
app.use(trackHttpDuration);

// Expose metrics endpoint
app.get('/metrics', metricsEndpoint);
```

---

## 🔔 Alerting Rules

### Sentry Alerts

**Configure in Sentry Dashboard:**

1. **High Error Rate**
   - Condition: Error count > 50 in 1 hour
   - Action: Send to Slack + Email

2. **Performance Degradation**
   - Condition: P95 response time > 2 seconds
   - Action: Send to Slack

3. **Critical Errors**
   - Condition: Error contains "payment failed"
   - Action: SMS + Email + Slack

### Custom Health Check

**File: `backend/routes/health.js`**
```javascript
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('../config/logger');

router.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'OK',
    checks: {},
  };
  
  try {
    // Database check
    if (mongoose.connection.readyState === 1) {
      health.checks.database = 'OK';
    } else {
      health.checks.database = 'FAILED';
      health.status = 'DEGRADED';
    }
    
    // Memory check
    const memUsage = process.memoryUsage();
    health.checks.memory = {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      status: memUsage.heapUsed < 500000000 ? 'OK' : 'WARNING',
    };
    
    // Response
    const statusCode = health.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'ERROR',
      message: error.message,
    });
  }
});

// Readiness check
router.get('/ready', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.status(200).json({ status: 'ready' });
  } else {
    res.status(503).json({ status: 'not ready' });
  }
});

// Liveness check
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

module.exports = router;
```

---

## 📈 Dashboard Setup

### Grafana + Prometheus

**docker-compose.yml for monitoring stack:**
```yaml
version: '3'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus-data:
  grafana-data:
```

**prometheus.yml:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'escrow-api'
    static_configs:
      - targets: ['your-api-domain.com:443']
        labels:
          service: 'api'
    metrics_path: '/metrics'
    scheme: 'https'
```

---

## ✅ Monitoring Checklist

- [ ] Sentry configured (backend & frontend)
- [ ] Error tracking active
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring set up
- [ ] Health endpoints created
- [ ] Custom metrics implemented
- [ ] Logging configured
- [ ] Alerts configured
- [ ] Dashboard created
- [ ] Team notifications working

---

## 🎉 You're All Set!

Your application now has comprehensive monitoring and error tracking! 📊🚨
