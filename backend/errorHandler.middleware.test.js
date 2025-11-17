const { errorHandler, AppError, catchAsync, notFound } = require('./middleware/errorHandler');

describe('Error Handler Middleware Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/test-route',
      method: 'GET'
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
  });

  describe('AppError Class', () => {
    test('should create operational error with correct properties', () => {
      const error = new AppError('Test error message', 400);
      
      expect(error.message).toBe('Test error message');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    test('should set status to "error" for 500 level errors', () => {
      const error = new AppError('Server error', 500);
      
      expect(error.status).toBe('error');
    });

    test('should set status to "fail" for 400 level errors', () => {
      const error = new AppError('Client error', 404);
      
      expect(error.status).toBe('fail');
    });
  });

  describe('catchAsync', () => {
    test('should catch async errors and pass to next', async () => {
      const asyncError = new Error('Async operation failed');
      const asyncFn = catchAsync(async (req, res, next) => {
        throw asyncError;
      });

      await asyncFn(req, res, next);

      expect(next).toHaveBeenCalledWith(asyncError);
    });

    test('should allow successful async operations', async () => {
      const asyncFn = catchAsync(async (req, res, next) => {
        res.json({ success: true });
      });

      await asyncFn(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('notFound Handler', () => {
    test('should create 404 error with route information', () => {
      notFound(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('/test-route');
    });
  });

  describe('errorHandler Middleware', () => {
    test('should handle operational errors in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new AppError('Test error', 400);
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(false);
      expect(jsonCall.message).toBe('Test error');
      expect(jsonCall.stack).toBeDefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle operational errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new AppError('Test error', 400);
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.success).toBe(false);
      expect(jsonCall.message).toBe('Test error');
      expect(jsonCall.stack).toBeUndefined();

      process.env.NODE_ENV = originalEnv;
    });

    test('should hide non-operational errors in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const error = new Error('Programming error');
      error.isOperational = false;
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalled();
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toBe('Something went wrong!');

      consoleErrorSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });

    test('should use default status code 500 if not provided', () => {
      const error = new Error('Error without status code');
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Error Type Handling', () => {
    test('should handle MongoDB CastError', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        name: 'CastError',
        path: '_id',
        value: 'invalid-id'
      };
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toContain('Invalid');

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle MongoDB duplicate key error', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        code: 11000,
        keyValue: { email: 'test@example.com' }
      };
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toContain('Duplicate');

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle JWT errors', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        name: 'JsonWebTokenError'
      };
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toContain('token');

      process.env.NODE_ENV = originalEnv;
    });

    test('should handle JWT expired error', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = {
        name: 'TokenExpiredError'
      };
      
      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      const jsonCall = res.json.mock.calls[0][0];
      expect(jsonCall.message).toContain('expired');

      process.env.NODE_ENV = originalEnv;
    });
  });
});
