import { describe, it, expect } from 'vitest';

describe('Sample Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should perform arithmetic correctly', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings', () => {
    expect('hello').toBe('hello');
  });

  it('should handle arrays', () => {
    const arr = [1, 2, 3];
    expect(arr).toHaveLength(3);
    expect(arr).toContain(2);
  });

  it('should handle objects', () => {
    const obj = { name: 'test', value: 123 };
    expect(obj).toHaveProperty('name');
    expect(obj.value).toBe(123);
  });
});
