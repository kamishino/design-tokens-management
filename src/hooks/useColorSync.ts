import { useState, useCallback } from 'react';
import { hexToHsl, hslToHex, hexToOklch, oklchToHex } from '../utils/colors';

export interface ColorCoordinates {
  hex: string;
  hsl: { h: number; s: number; l: number };
  oklch: { l: number; c: number; h: number };
}

export const useColorSync = (initialColor: string) => {
  const [coords, setCoords] = useState<ColorCoordinates>(() => ({
    hex: initialColor,
    hsl: hexToHsl(initialColor),
    oklch: hexToOklch(initialColor)
  }));

  const [prevColor, setPrevColor] = useState(initialColor);

  // Sync state when external color prop changes (using the 'Adjusting state' pattern)
  if (initialColor.toLowerCase() !== prevColor.toLowerCase()) {
    setPrevColor(initialColor);
    setCoords({
      hex: initialColor,
      hsl: hexToHsl(initialColor),
      oklch: hexToOklch(initialColor)
    });
  }

  const updateFromHex = useCallback((hex: string) => {
    setCoords({
      hex,
      hsl: hexToHsl(hex),
      oklch: hexToOklch(hex)
    });
    return hex;
  }, []);

  const updateFromHSL = useCallback((h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    setCoords({
      hex,
      hsl: { h, s, l },
      oklch: hexToOklch(hex)
    });
    return hex;
  }, []);

  const updateFromOklch = useCallback((l: number, c: number, h: number) => {
    const hex = oklchToHex(l, c, h);
    setCoords({
      hex,
      oklch: { l, c, h },
      hsl: hexToHsl(hex)
    });
    return hex;
  }, []);

  return {
    coords,
    updateFromHex,
    updateFromHSL,
    updateFromOklch
  };
};