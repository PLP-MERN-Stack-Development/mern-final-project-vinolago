const { helmetConfig, limiter, authLimiter, transactionLimiter, paymentLimiter, sanitize, limiterOptions, authLimiterOptions, transactionLimiterOptions, paymentLimiterOptions } = require('./middleware/security');
const express = require('express');
const request = require('supertest');

describe('Security Middleware Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
  });

  describe('Helmet Configuration', () => {
    test('should apply helmet security headers', async () => {
      app.use(helmetConfig);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test');

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should set appropriate CSP headers', async () => {
      app.use(helmetConfig);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test');

      expect(response.headers).toHaveProperty('content-security-policy');
    });
  });

  describe('Rate Limiting', () => {
    test('should allow requests under the limit', async () => {
      app.use(limiter);
      app.get('/test', (req, res) => res.json({ ok: true }));

      const response = await request(app).get('/test');
      expect(response.status).toBe(200);
    });

    test('should have appropriate window and max limits for general limiter', () => {
      expect(limiterOptions.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(limiterOptions.max).toBe(100);
    });

    test('should have stricter limits for auth endpoints', () => {
      expect(authLimiterOptions.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(authLimiterOptions.max).toBe(5);
      expect(authLimiterOptions.skipSuccessfulRequests).toBe(true);
    });

    test('should have appropriate limits for transactions', () => {
      expect(transactionLimiterOptions.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(transactionLimiterOptions.max).toBe(20);
    });

    test('should have appropriate limits for payments', () => {
      expect(paymentLimiterOptions.windowMs).toBe(60 * 1000); // 1 minute
      expect(paymentLimiterOptions.max).toBe(10);
    });
  });

  describe('MongoDB Sanitization', () => {
    beforeEach(() => {
      app.use(express.json());
      app.use(sanitize);
      app.post('/test', (req, res) => res.json(req.body));
    });

    test('should sanitize $ operators from request body', async () => {
      const maliciousPayload = {
        username: 'test',
        $where: 'malicious code'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .set('Content-Type', 'application/json');

      expect(response.body).not.toHaveProperty('$where');
      expect(response.body.username).toBe('test');
    });

    test('should sanitize . operators from request body', async () => {
      const maliciousPayload = {
        'user.isAdmin': true,
        username: 'test'
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .set('Content-Type', 'application/json');

      expect(response.body).not.toHaveProperty('user.isAdmin');
      expect(response.body.username).toBe('test');
    });

    test('should allow normal data to pass through', async () => {
      const normalPayload = {
        username: 'john',
        email: 'john@example.com',
        age: 25
      };

      const response = await request(app)
        .post('/test')
        .send(normalPayload)
        .set('Content-Type', 'application/json');

      expect(response.body).toEqual(normalPayload);
    });

    test('should sanitize nested objects', async () => {
      const maliciousPayload = {
        user: {
          name: 'John',
          $gt: { age: 18 }
        }
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .set('Content-Type', 'application/json');

      expect(response.body.user).not.toHaveProperty('$gt');
      expect(response.body.user.name).toBe('John');
    });

    test('should sanitize arrays', async () => {
      const maliciousPayload = {
        users: [
          { name: 'John' },
          { $where: 'malicious' }
        ]
      };

      const response = await request(app)
        .post('/test')
        .send(maliciousPayload)
        .set('Content-Type', 'application/json');

      expect(response.body.users[0].name).toBe('John');
      expect(response.body.users[1]).not.toHaveProperty('$where');
    });
  });

  describe('Security Middleware Integration', () => {
    test('should work together without conflicts', async () => {
      app.use(helmetConfig);
      app.use(express.json());
      app.use(sanitize);
      app.use(limiter);
      app.post('/test', (req, res) => {
        res.json({ success: true, data: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ username: 'test', email: 'test@example.com' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers).toHaveProperty('x-content-type-options');
    });
  });

  describe('Rate Limit Messages', () => {
    test('general limiter should have appropriate message', () => {
      expect(limiterOptions.message).toBe('Too many requests from this IP, please try again later.');
    });

    test('auth limiter should have specific message', () => {
      expect(authLimiterOptions.message).toBe('Too many authentication attempts, please try again later.');
    });

    test('transaction limiter should have specific message', () => {
      expect(transactionLimiterOptions.message).toBe('Too many transactions created, please try again later.');
    });

    test('payment limiter should have specific message', () => {
      expect(paymentLimiterOptions.message).toBe('Too many payment requests, please try again later.');
    });
  });
});
