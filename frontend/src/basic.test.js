import { describe, it, expect } from 'vitest';

describe('Basic Test', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle true condition', () => {
    expect(true).toBe(true);
  });

  it('should handle string comparison', () => {
    expect('hello').toBe('hello');
  });
});