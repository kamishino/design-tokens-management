import { useState, useCallback, useRef, useEffect } from 'react';
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

  const lastOutput = useRef<string>(initialColor);

  // Sync state only when EXTERNAL color prop changes significantly
  // (Ignoring our own internal slider updates which might be clamped)
  useEffect(() => {
    if (initialColor.toLowerCase() !== lastOutput.current.toLowerCase()) {
      lastOutput.current = initialColor;
      setCoords({
        hex: initialColor,
        hsl: hexToHsl(initialColor),
        oklch: hexToOklch(initialColor)
      });
    }
  }, [initialColor]);

  const updateFromHex = useCallback((hex: string) => {
    lastOutput.current = hex;
    setCoords({
      hex,
      hsl: hexToHsl(hex),
      oklch: hexToOklch(hex)
    });
    return hex;
  }, []);

  const updateFromHSL = useCallback((h: number, s: number, l: number) => {
    const hex = hslToHex(h, s, l);
    lastOutput.current = hex;
    setCoords({
      hex,
      hsl: { h, s, l },
      oklch: hexToOklch(hex)
    });
    return hex;
  }, []);

  const updateFromOklch = useCallback((l: number, c: number, h: number) => {
    const hex = oklchToHex(l, c, h);
    lastOutput.current = hex;
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
