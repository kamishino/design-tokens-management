import { describe, it, expect } from 'vitest';
import { BaseTokenSchema, ColorTokenSchema } from './tokens';

describe('Token Schemas (W3C Format)', () => {
  it('should validate a correct base token', () => {
    const validToken = {
      $value: '16px',
      $type: 'dimension',
      $description: 'Base font size'
    };
    const result = BaseTokenSchema.safeParse(validToken);
    expect(result.success).toBe(true);
  });

  it('should fail if $value is missing', () => {
    const invalidToken = {
      $type: 'dimension'
    };
    const result = BaseTokenSchema.safeParse(invalidToken);
    expect(result.success).toBe(false);
  });

  it('should validate a correct color token', () => {
    const validColor = {
      $value: '#ff0000',
      $type: 'color'
    };
    const result = ColorTokenSchema.safeParse(validColor);
    expect(result.success).toBe(true);
  });

  it('should fail if color format is invalid', () => {
    const invalidColor = {
      $value: 'not-a-color',
      $type: 'color'
    };
    const result = ColorTokenSchema.safeParse(invalidColor);
    expect(result.success).toBe(false);
  });
});
