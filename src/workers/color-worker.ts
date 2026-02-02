import { converter, rgb } from 'culori';

const oklch = converter('oklch');
const hsl = converter('hsl');

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

const calculateContrast = (fg: string, bg: string) => {
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const apcaScore = Math.abs(Math.pow(l1, 0.45) - Math.pow(l2, 0.45)) * 100;
  return {
    wcag: ratio,
    apca: Math.round(apcaScore),
    isAccessible: ratio >= 4.5
  };
};

onmessage = (e: MessageEvent<any>) => {
  const { id, action, payload } = e.data;

  try {
    switch (action) {
      case 'convert': {
        const { hex } = payload;
        const resOklch = oklch(hex);
        const resHsl = hsl(hex);
        postMessage({
          id,
          data: {
            oklch: resOklch ? { l: resOklch.l, c: resOklch.c, h: resOklch.h } : null,
            hsl: resHsl ? { h: resHsl.h, s: (resHsl.s || 0) * 100, l: (resHsl.l || 0) * 100 } : null
          }
        });
        break;
      }
      case 'contrast': {
        const { fg, bg } = payload;
        postMessage({ id, data: calculateContrast(fg, bg) });
        break;
      }
      case 'suggest': {
        const { color, baseSwatches, target } = payload;
        const results = baseSwatches.map((s: any) => ({
          ...s,
          ...calculateContrast(target === 'text' ? s.hex : color, target === 'bg' ? s.hex : color)
        }));
        
        const suggestions = results
          .filter((r: any) => r.wcag >= 4.5)
          .sort((a: any, b: any) => b.wcag - a.wcag)
          .slice(0, 3);

        postMessage({ id, data: suggestions });
        break;
      }
      default:
        postMessage({ id, error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    postMessage({ id, error: err.message });
  }
};
