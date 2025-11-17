const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Create a test app
const createTestApp = () => {
  const app = express();
  
  // Import middleware
  const { combinedLogger, errorLogger } = require('./middleware/logger');
  const { helmetConfig, limiter, sanitize } = require('./middleware/security');
  const { errorHandler, notFound } = require('./middleware/errorHandler');
  
  // Apply middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(helmetConfig);
  app.use(sanitize);
  app.use(limiter);
  
  // Test routes
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Test successful' });
  });
  
  app.get('/api/error', (req, res, next) => {
    const error = new Error('Test error');
    error.statusCode = 500;
    next(error);
  });
  
  // Additional test routes for integration tests
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
  
  // Error handling
  app.use(notFound);
  app.use(errorLogger);
  app.use(errorHandler);
  
  return app;
};

describe('API Integration Tests', () => {
  let app;
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    app = createTestApp();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  describe('Health Check Endpoints', () => {
    test('GET /api/test should return success message', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.message).toBe('Test successful');
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should handle server errors gracefully', async () => {
      const response = await request(app)
        .get('/api/error')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers from helmet', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });

  describe('Request Body Parsing', () => {
    test('should parse JSON request bodies', async () => {
      const testData = { name: 'Test', value: 123 };
      const response = await request(app)
        .post('/api/test-json')
        .send(testData)
        .set('Content-Type', 'application/json')
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });

    test('should parse URL-encoded request bodies', async () => {
      const response = await request(app)
        .post('/api/test-urlencoded')
        .send('name=Test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .expect(200);

      expect(response.body.received.name).toBe('Test');
      expect(response.body.received.value).toBe('123');
    });
  });

  describe('MongoDB Sanitization', () => {
    test('should sanitize MongoDB operators in request body', async () => {
      const maliciousData = {
        name: 'Test',
        $where: 'malicious code'
      };

      const response = await request(app)
        .post('/api/test-sanitize')
        .send(maliciousData)
        .set('Content-Type', 'application/json')
        .expect(200);

      // MongoDB operators should be sanitized
      expect(response.body.received).not.toHaveProperty('$where');
      expect(response.body.received.name).toBe('Test');
    });
  });

  describe('HTTP Methods', () => {
    test('should handle GET requests', async () => {
      await request(app)
        .get('/api/test')
        .expect(200);
    });

    test('should handle POST requests', async () => {
      await request(app)
        .post('/api/test-post')
        .expect(201);
    });

    test('should handle PUT requests', async () => {
      await request(app)
        .put('/api/test-put')
        .expect(200);
    });

    test('should handle DELETE requests', async () => {
      await request(app)
        .delete('/api/test-delete')
        .expect(204);
    });
  });

  describe('Response Formats', () => {
    test('should return JSON by default', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect('Content-Type', /json/);

      expect(response.body).toBeInstanceOf(Object);
    });

    test('should handle error responses in JSON', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });
});
