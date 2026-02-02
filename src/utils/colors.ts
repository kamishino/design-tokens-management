import { converter, formatHex, inGamut, toGamut } from 'culori';

const oklch = converter('oklch');
const hsl = converter('hsl');
const rgb = converter('rgb');
const isRgb = inGamut('rgb');
const clampRgb = toGamut('rgb');

export const hexToOklch = (hex: string) => {
  const color = oklch(hex);
  return color ? { l: color.l || 0, c: color.c || 0, h: color.h || 0 } : { l: 0, c: 0, h: 0 };
};

export const oklchToHex = (l: number, c: number, h: number) => {
  return formatHex({ mode: 'oklch', l, c, h });
};

export const hexToHsl = (hex: string) => {
  const color = hsl(hex);
  return color ? { h: color.h || 0, s: (color.s || 0) * 100, l: (color.l || 0) * 100 } : { h: 0, s: 0, l: 0 };
};

export const hslToHex = (h: number, s: number, l: number) => {
  return formatHex({ mode: 'hsl', h, s: s / 100, l: l / 100 });
};

/**
 * Checks if a color is representable in standard sRGB (HEX)
 */
export const isOutofGamut = (mode: 'oklch' | 'hsl', coords: any) => {
  return !isRgb({ mode, ...coords });
};

/**
 * Maps an out-of-gamut color to the nearest sRGB safe HEX
 */
export const getSafeHex = (mode: 'oklch' | 'hsl', coords: any) => {
  return formatHex(clampRgb({ mode, ...coords }));
};

// WCAG 2.1 Relative Luminance formula
const getLuminance = (hex: string) => {
  const color = rgb(hex);
  if (!color) return 0;
  const { r, g, b } = color;
  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

export const getContrastMetrics = (fg: string, bg: string) => {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  // Perceptual Contrast (Simplified APCA-like math for Lc)
  // Real APCA is much more complex, this is a linear perceptual diff for UI guidance
  const apcaScore = Math.abs(Math.pow(l1, 0.45) - Math.pow(l2, 0.45)) * 100;

  return {
    wcag: ratio,
    apca: Math.round(apcaScore),
    isAccessible: ratio >= 4.5
  };
};