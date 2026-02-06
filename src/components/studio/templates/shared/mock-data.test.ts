import { generateStudioMockData } from './mock-data';
import { describe, it, expect } from 'vitest';

describe('generateStudioMockData', () => {
  it('should return a valid StudioMockData object', () => {
    const data = generateStudioMockData();
    
    expect(data).toHaveProperty('product');
    expect(data).toHaveProperty('dashboard');
    expect(data).toHaveProperty('brand');
    
    expect(typeof data.product.name).toBe('string');
    expect(data.dashboard.recentTransactions).toHaveLength(8);
    expect(data.brand.tagline).toBeDefined();
  });

  it('should generate unique data each time', () => {
    const data1 = generateStudioMockData();
    const data2 = generateStudioMockData();
    
    expect(data1.product.name).not.toBe(data2.product.name);
  });
});
