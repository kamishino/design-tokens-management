import { converter, formatHex } from 'culori';

const okhsl = converter('okhsl');
const rgb = converter('rgb');

export const hexToOkhsl = (hex: string) => {
  const color = okhsl(hex);
  return color ? { h: color.h || 0, s: color.s || 0, l: color.l || 0 } : { h: 0, s: 0, l: 0 };
};

export const okhslToHex = (h: number, s: number, l: number) => {
  return formatHex({ mode: 'okhsl', h, s, l });
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
  
  // Simple APCA approximation for demo (WCAG 3.0 draft is complex)
  // Real APCA uses different coefficients and exponent
  const apcaScore = Math.abs(l1 - l2) * 100; 

  return {
    wcag: ratio,
    apca: Math.round(apcaScore),
    isAccessible: ratio >= 4.5
  };
};
