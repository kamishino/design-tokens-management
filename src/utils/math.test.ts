import { describe, it, expect } from 'vitest';

// Helper function mirroring the logic in script
const calculateScale = (base: number, ratio: number, step: number) => {
  return Math.round(base * Math.pow(ratio, step));
};

describe('Modular Scale Logic', () => {
  it('should calculate base step (0) correctly', () => {
    expect(calculateScale(16, 1.25, 0)).toBe(16);
  });

  it('should calculate step 1 correctly (Major Third)', () => {
    // 16 * 1.25 = 20
    expect(calculateScale(16, 1.25, 1)).toBe(20);
  });

  it('should calculate negative steps correctly', () => {
    // 16 / 1.25 = 12.8 -> 13
    expect(calculateScale(16, 1.25, -1)).toBe(13);
  });
});
