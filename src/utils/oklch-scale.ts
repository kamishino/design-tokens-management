/**
 * OKLCH Color Scale Generator
 *
 * Generates 10-step shade scales (50, 100, 200, ..., 900) from a base color
 * using OKLCH lightness ramp. Maintains hue and adjusts chroma for gamut mapping.
 *
 * Uses culori for color space conversion and sRGB gamut clamping.
 */
import { oklch, formatHex, clampChroma } from "culori";

export interface ColorShade {
  step: number; // 50, 100, 200, ..., 900
  hex: string;
  oklch: { l: number; c: number; h: number };
}

export interface ColorScale {
  name: string;
  baseHex: string;
  baseStep: number; // which step the original color maps to
  shades: ColorShade[];
}

/** Lightness targets for each step (0-1 scale in OKLCH) */
const LIGHTNESS_RAMP: Record<number, number> = {
  50: 0.97,
  100: 0.93,
  200: 0.87,
  300: 0.78,
  400: 0.68,
  500: 0.57,
  600: 0.48,
  700: 0.39,
  800: 0.30,
  900: 0.22,
};

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

/**
 * Find the closest step for a given lightness value
 */
function findClosestStep(lightness: number): number {
  let closest = 500;
  let minDist = Infinity;
  for (const [step, l] of Object.entries(LIGHTNESS_RAMP)) {
    const dist = Math.abs(l - lightness);
    if (dist < minDist) {
      minDist = dist;
      closest = Number(step);
    }
  }
  return closest;
}

/**
 * Generate a 10-step shade scale from any hex color.
 *
 * @param hex - Base color in hex format (e.g. "#4A6DA7")
 * @param name - Label for this scale (e.g. "Blue", "Primary")
 * @returns ColorScale with 10 shades
 */
export function generateColorScale(hex: string, name: string): ColorScale {
  const base = oklch(hex);
  if (!base) {
    // Fallback for unparseable colors
    return {
      name,
      baseHex: hex,
      baseStep: 500,
      shades: STEPS.map((step) => ({
        step,
        hex: "#808080",
        oklch: { l: LIGHTNESS_RAMP[step], c: 0, h: 0 },
      })),
    };
  }

  const baseL = base.l ?? 0.5;
  const baseC = base.c ?? 0;
  const baseH = base.h ?? 0;
  const baseStep = findClosestStep(baseL);

  const shades: ColorShade[] = STEPS.map((step) => {
    const targetL = LIGHTNESS_RAMP[step];

    // Scale chroma: reduce for very light/dark shades, maintain near base
    const distFromMid = Math.abs(targetL - 0.5);
    const chromaScale = Math.max(0, 1 - distFromMid * 1.5);
    const targetC = baseC * chromaScale;

    // Gamut-map to sRGB
    const raw = { mode: "oklch" as const, l: targetL, c: targetC, h: baseH };
    const clamped = clampChroma(raw, "oklch");
    const hexOut = formatHex(clamped) ?? "#000000";

    return {
      step,
      hex: hexOut,
      oklch: {
        l: Math.round(targetL * 100),
        c: Math.round((clamped?.c ?? targetC) * 1000) / 1000,
        h: Math.round(baseH),
      },
    };
  });

  return { name, baseHex: hex, baseStep, shades };
}

/**
 * Generate scales for all semantic colors.
 */
export function generateAllScales(
  colors: Record<string, { hex: string; label: string }>,
): ColorScale[] {
  return Object.entries(colors).map(([, { hex, label }]) =>
    generateColorScale(hex, label),
  );
}
