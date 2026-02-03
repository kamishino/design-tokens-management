import { describe, it, expect } from 'vitest';
import { parseTokensToDocs } from './token-parser';

describe('Token Parser for Docs', () => {
  it('should flatten nested JSON correctly', () => {
    const input = {
      color: {
        blue: {
          500: { $value: '#0000ff', $type: 'color' }
        }
      }
    };
    
    const results = parseTokensToDocs(input);
    expect(results).toHaveLength(1);
    expect(results[0].jsPath).toBe('tokens.color.blue.500');
    expect(results[0].cssVariable).toBe('--colorBlue500');
  });

  it('should handle multiple tokens', () => {
    const input = {
      brand: {
        primary: { $value: '#ff0000' },
        secondary: { $value: '#00ff00' }
      }
    };
    const results = parseTokensToDocs(input);
    expect(results).toHaveLength(2);
  });
});
