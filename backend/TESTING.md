# Testing Framework Setup

This backend uses Jest as the comprehensive testing framework with the following features:

## Testing Stack

- **Jest**: Test runner and assertion library
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **@jest/globals**: Jest global functions

## Test Scripts

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

### Test Files Created

1. **user.model.test.js** - Unit tests for User model
   - User creation and validation
   - Wallet functionality
   - Query methods
   - Unique constraints

2. **errorHandler.middleware.test.js** - Unit tests for error handling
   - AppError class
   - catchAsync wrapper
   - notFound handler
   - Error type handling (MongoDB, JWT, etc.)

3. **security.middleware.test.js** - Unit tests for security middleware
   - Helmet security headers
   - Rate limiting configuration
   - MongoDB sanitization
   - Integration between security layers

4. **api.integration.test.js** - Integration tests for API
   - Health check endpoints
   - Error handling flow
   - Security headers
   - Request body parsing
   - HTTP methods
   - Response formats

## Test Configuration

### jest.config.js

```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testTimeout: 30000,
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js'
  ]
}
```

## Writing New Tests

### Unit Test Example

```javascript
describe('Feature Name', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Integration Test Example

```javascript
describe('API Endpoint', () => {
  test('POST /api/resource should create resource', async () => {
    const response = await request(app)
      .post('/api/resource')
      .send({ data: 'test' })
      .expect(201);
      
    expect(response.body).toHaveProperty('id');
  });
});
```

## Database Testing

Tests use MongoDB Memory Server for isolated, in-memory database testing:

```javascript
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clean up after each test
  await User.deleteMany({});
});
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

Aim for:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Best Practices

1. **Isolation**: Each test should be independent
2. **Clear naming**: Describe what the test does
3. **AAA Pattern**: Arrange, Act, Assert
4. **Mock external dependencies**: Database, APIs, etc.
5. **Test edge cases**: Not just happy paths
6. **Keep tests fast**: Use in-memory databases

## Running Tests Before Commit

Always run tests before committing:

```bash
npm test
```

## Continuous Integration

Tests should be run automatically on:
- Pull requests
- Merges to main branch
- Pre-deployment

## Next Steps

To complete the testing setup:

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Add tests for remaining routes (transactions, payments, admin)
4. Add end-to-end tests for critical user flows
5. Set up CI/CD pipeline with automated testing
