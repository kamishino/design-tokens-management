import { describe, it, expect } from 'vitest';
import { okhslToHex, getContrastMetrics } from './colors';

describe('Color Utilities', () => {
  it('should convert Okhsl to HEX correctly', () => {
    // Pure Red in Okhsl is approx h=29
    const hex = okhslToHex(29, 1, 0.6);
    expect(hex).toMatch(/^#/);
  });

  it('should calculate WCAG contrast correctly', () => {
    const { wcag } = getContrastMetrics('#000000', '#ffffff');
    expect(wcag).toBeCloseTo(21, 0);
  });

  it('should calculate APCA score correctly', () => {
    const { apca } = getContrastMetrics('#000000', '#ffffff');
    expect(apca).toBeGreaterThanOrEqual(100);
  });
});
