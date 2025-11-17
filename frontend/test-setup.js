import { afterEach, vi } from 'vitest';

// Setup jest-dom matchers
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
  useUser: vi.fn(() => ({
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  })),
  useAuth: vi.fn(() => ({
    isSignedIn: true,
    userId: 'test-user-id',
    sessionId: 'test-session-id',
    getToken: vi.fn(() => Promise.resolve('mock-token')),
  })),
  ClerkProvider: ({ children }) => children,
  SignIn: () => null,
  SignUp: () => null,
  UserButton: () => null,
}));

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:5000/api';
process.env.VITE_CLERK_PUBLISHABLE_KEY = 'pk_test_mock_key';
