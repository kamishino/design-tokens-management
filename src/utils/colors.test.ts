import { describe, it, expect } from 'vitest';
import { oklchToHex, hexToOklch, hslToHex, isOutofGamut, getSafeHex, getContrastMetrics } from './colors';

describe('Advanced Color Utilities', () => {
  it('should convert Oklch to HEX and back', () => {
    const hex = '#3b82f6';
    const oklch = hexToOklch(hex);
    const backToHex = oklchToHex(oklch.l, oklch.c, oklch.h);
    expect(backToHex).toBe(hex);
  });

  it('should convert HSL to HEX', () => {
    const hex = hslToHex(0, 100, 50); // Pure Red
    expect(hex?.toLowerCase()).toBe('#ff0000');
  });

  it('should detect out-of-gamut Oklch colors', () => {
    // Very high chroma yellow is impossible in sRGB
    const coords = { l: 0.9, c: 0.4, h: 100 };
    expect(isOutofGamut('oklch', coords)).toBe(true);
  });

  it('should provide a safe HEX for out-of-gamut colors', () => {
    const coords = { l: 0.9, c: 0.4, h: 100 };
    const safeHex = getSafeHex('oklch', coords);
    expect(safeHex).toMatch(/^#/);
    expect(isOutofGamut('oklch', hexToOklch(safeHex))).toBe(false);
  });

  it('should calculate contrast ratio correctly', () => {
    const { wcag } = getContrastMetrics('#000000', '#ffffff');
    expect(wcag).toBeCloseTo(21, 0);
  });
});