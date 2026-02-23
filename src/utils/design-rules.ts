/**
 * Design Rules Engine (Phase L)
 *
 * Extensible rule engine that analyzes design tokens and overrides,
 * producing actionable suggestions with 1-click fix payloads.
 */
import { wcagContrast, converter, parse } from "culori";

const toOklch = converter("oklch");

// ─── Types ───────────────────────────────────────────────────

export type RuleCategory = "color" | "typography" | "accessibility";
export type Severity = "error" | "warning" | "info";

export interface Suggestion {
  ruleId: string;
  title: string;
  description: string;
  category: RuleCategory;
  severity: Severity;
  /** If present, user can 1-click apply this fix */
  fix?: { variable: string; value: string };
}

export interface AnalysisContext {
  /** Current semantic color values (effective = base + overrides) */
  colors: {
    variable: string;
    label: string;
    hex: string;
  }[];
  /** Typography settings */
  typography: {
    baseSize: number;
    scaleRatio: number;
    lineHeight: number;
    headingFont: string;
    bodyFont: string;
    codeFont: string;
  };
}

export interface DesignRule {
  id: string;
  name: string;
  category: RuleCategory;
  analyze: (ctx: AnalysisContext) => Suggestion[];
}

// ─── Utility Helpers ──────────────────────────────────────────

function getOklch(hex: string) {
  const p = parse(hex);
  if (!p) return null;
  return toOklch(p);
}

function hueDifference(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return diff > 180 ? 360 - diff : diff;
}

function findByVar(
  colors: AnalysisContext["colors"],
  variable: string,
): string | undefined {
  return colors.find((c) => c.variable === variable)?.hex;
}

// ─── Standard Rules ───────────────────────────────────────────

// L1: Contrast Sentinel
const contrastRules: DesignRule[] = [
  {
    id: "contrast-text-on-bg",
    name: "Text on Background",
    category: "color",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      const bg = findByVar(ctx.colors, "--bg-body") ??
        findByVar(ctx.colors, "--bg-canvas") ?? "#ffffff";
      const textHex = findByVar(ctx.colors, "--text-primary") ?? "#000000";
      const ratio = wcagContrast(textHex, bg);

      if (ratio < 4.5) {
        suggestions.push({
          ruleId: "contrast-text-on-bg",
          title: "Text contrast too low",
          description: `Text on background has ${ratio.toFixed(1)}:1 contrast (need ≥ 4.5:1 for WCAG AA).`,
          category: "color",
          severity: "error",
          fix: { variable: "--text-primary", value: "#1a1a1a" },
        });
      }
      return suggestions;
    },
  },
  {
    id: "contrast-primary-on-bg",
    name: "Primary on Background",
    category: "color",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      const bg = findByVar(ctx.colors, "--bg-body") ??
        findByVar(ctx.colors, "--bg-canvas") ?? "#ffffff";
      const primary = findByVar(ctx.colors, "--brand-primary");
      if (!primary) return suggestions;

      const ratio = wcagContrast(primary, bg);
      if (ratio < 3.0) {
        // Suggest a darker shade
        const oklch = getOklch(primary);
        if (oklch) {
          suggestions.push({
            ruleId: "contrast-primary-on-bg",
            title: "Primary color low contrast",
            description: `Primary on background has ${ratio.toFixed(1)}:1 (need ≥ 3:1 for large text). Consider a darker shade.`,
            category: "color",
            severity: "warning",
          });
        }
      }
      return suggestions;
    },
  },
  {
    id: "contrast-accent-on-bg",
    name: "Accent on Background",
    category: "color",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      const bg = findByVar(ctx.colors, "--bg-body") ??
        findByVar(ctx.colors, "--bg-canvas") ?? "#ffffff";
      const accent = findByVar(ctx.colors, "--brand-accent");
      if (!accent) return suggestions;

      const ratio = wcagContrast(accent, bg);
      if (ratio < 3.0) {
        suggestions.push({
          ruleId: "contrast-accent-on-bg",
          title: "Accent color low contrast",
          description: `Accent on background has ${ratio.toFixed(1)}:1 (need ≥ 3:1). May be invisible as CTA text.`,
          category: "color",
          severity: "warning",
        });
      }
      return suggestions;
    },
  },
];

// L2: Typography Guardrails
const typographyRules: DesignRule[] = [
  {
    id: "typo-line-height-body",
    name: "Body Line Height",
    category: "typography",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      if (ctx.typography.lineHeight < 1.4) {
        suggestions.push({
          ruleId: "typo-line-height-body",
          title: "Line height too tight",
          description: `Line height ${ctx.typography.lineHeight} is below 1.4. Body text becomes hard to read. Recommended: 1.5.`,
          category: "typography",
          severity: "warning",
          fix: { variable: "--typography-line-height", value: "1.5" },
        });
      }
      if (ctx.typography.lineHeight > 1.8) {
        suggestions.push({
          ruleId: "typo-line-height-body",
          title: "Line height too loose",
          description: `Line height ${ctx.typography.lineHeight} is above 1.8. Text feels disconnected. Recommended: 1.5.`,
          category: "typography",
          severity: "info",
          fix: { variable: "--typography-line-height", value: "1.5" },
        });
      }
      return suggestions;
    },
  },
  {
    id: "typo-scale-ratio",
    name: "Scale Ratio Range",
    category: "typography",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      if (ctx.typography.scaleRatio > 1.5) {
        suggestions.push({
          ruleId: "typo-scale-ratio",
          title: "Scale ratio too aggressive",
          description: `Ratio ${ctx.typography.scaleRatio} creates very large headings. Consider ≤ 1.333 (Perfect Fourth) for more balanced hierarchy.`,
          category: "typography",
          severity: "warning",
          fix: { variable: "--typography-config-scale-ratio", value: "1.333" },
        });
      }
      if (ctx.typography.scaleRatio < 1.1) {
        suggestions.push({
          ruleId: "typo-scale-ratio",
          title: "Scale ratio too flat",
          description: `Ratio ${ctx.typography.scaleRatio} makes headings barely larger than body. Consider ≥ 1.2 (Minor Third).`,
          category: "typography",
          severity: "info",
          fix: { variable: "--typography-config-scale-ratio", value: "1.2" },
        });
      }
      return suggestions;
    },
  },
  {
    id: "typo-base-size",
    name: "Base Font Size",
    category: "typography",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      if (ctx.typography.baseSize < 14) {
        suggestions.push({
          ruleId: "typo-base-size",
          title: "Base font size too small",
          description: `${ctx.typography.baseSize}px is below recommended minimum of 14px for screen reading.`,
          category: "typography",
          severity: "warning",
          fix: { variable: "--font-size-root", value: "16" },
        });
      }
      return suggestions;
    },
  },
  {
    id: "typo-same-font",
    name: "Heading = Body Font",
    category: "typography",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      if (
        ctx.typography.headingFont &&
        ctx.typography.bodyFont &&
        ctx.typography.headingFont === ctx.typography.bodyFont
      ) {
        // Get font pairing suggestion
        const pair = FONT_PAIRINGS[ctx.typography.headingFont];
        const suggestion = pair?.[0];
        suggestions.push({
          ruleId: "typo-same-font",
          title: "Heading and body fonts are identical",
          description: `Both use "${ctx.typography.headingFont}". Pairing different fonts creates stronger visual hierarchy.${suggestion ? ` Try "${suggestion}" for body.` : ""}`,
          category: "typography",
          severity: "info",
          ...(suggestion
            ? { fix: { variable: "--font-family-base", value: `${suggestion}, sans-serif` } }
            : {}),
        });
      }
      return suggestions;
    },
  },
];

// L3: Color Harmony Validator
const harmonyRules: DesignRule[] = [
  {
    id: "harmony-hue-distance",
    name: "Primary–Accent Hue Distance",
    category: "color",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      const primary = findByVar(ctx.colors, "--brand-primary");
      const accent = findByVar(ctx.colors, "--brand-accent");
      if (!primary || !accent) return suggestions;

      const pOklch = getOklch(primary);
      const aOklch = getOklch(accent);
      if (!pOklch || !aOklch || pOklch.h == null || aOklch.h == null)
        return suggestions;

      const dist = hueDifference(pOklch.h, aOklch.h);

      if (dist < 15) {
        suggestions.push({
          ruleId: "harmony-hue-distance",
          title: "Primary and Accent too similar",
          description: `Hue distance is only ${Math.round(dist)}°. Colors may look indistinguishable. Consider ≥ 30° separation.`,
          category: "color",
          severity: "warning",
        });
      }
      return suggestions;
    },
  },
  {
    id: "harmony-primary-secondary",
    name: "Primary–Secondary Relationship",
    category: "color",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      const primary = findByVar(ctx.colors, "--brand-primary");
      const secondary = findByVar(ctx.colors, "--brand-secondary");
      if (!primary || !secondary) return suggestions;

      const pOklch = getOklch(primary);
      const sOklch = getOklch(secondary);
      if (!pOklch || !sOklch) return suggestions;

      // Check if secondary is just slightly different — probably unintentional
      const hDist =
        pOklch.h != null && sOklch.h != null
          ? hueDifference(pOklch.h, sOklch.h)
          : 0;
      const lDist = Math.abs((pOklch.l ?? 0) - (sOklch.l ?? 0));

      if (hDist < 5 && lDist < 0.05) {
        suggestions.push({
          ruleId: "harmony-primary-secondary",
          title: "Primary and Secondary nearly identical",
          description: `Hue gap ${Math.round(hDist)}° and lightness gap ${Math.round(lDist * 100)}%. Use a darker/lighter shade, or a different hue for Secondary.`,
          category: "color",
          severity: "warning",
        });
      }
      return suggestions;
    },
  },
  {
    id: "harmony-lightness-balance",
    name: "Color Lightness Balance",
    category: "color",
    analyze: (ctx) => {
      const suggestions: Suggestion[] = [];
      const brandColors = ctx.colors.filter((c) =>
        c.variable.startsWith("--brand-"),
      );
      const oklchValues = brandColors
        .map((c) => ({ ...c, oklch: getOklch(c.hex) }))
        .filter((c) => c.oklch != null);

      const allDark = oklchValues.every(
        (c) => (c.oklch?.l ?? 0) < 0.35,
      );
      const allLight = oklchValues.every(
        (c) => (c.oklch?.l ?? 0) > 0.75,
      );

      if (allDark && oklchValues.length >= 2) {
        suggestions.push({
          ruleId: "harmony-lightness-balance",
          title: "All brand colors are dark",
          description:
            "Primary, Secondary, and Accent are all below 35% lightness. Consider a lighter accent for better visual pop.",
          category: "color",
          severity: "info",
        });
      }
      if (allLight && oklchValues.length >= 2) {
        suggestions.push({
          ruleId: "harmony-lightness-balance",
          title: "All brand colors are light",
          description:
            "All brand colors are above 75% lightness. They may lack contrast against white backgrounds.",
          category: "color",
          severity: "warning",
        });
      }
      return suggestions;
    },
  },
];

// L6: Smart Font Pairing matrix
export const FONT_PAIRINGS: Record<string, string[]> = {
  Inter: ["DM Serif Display", "Playfair Display", "Lora"],
  "DM Sans": ["DM Serif Display", "Playfair Display", "Source Serif 4"],
  Outfit: ["Lora", "Source Serif 4", "DM Serif Display"],
  Poppins: ["Lora", "Playfair Display", "Source Serif 4"],
  "Space Grotesk": ["Source Serif 4", "Lora", "DM Serif Display"],
  Raleway: ["Lora", "Playfair Display", "Source Serif 4"],
  "IBM Plex Sans": ["IBM Plex Serif", "Lora", "Source Serif 4"],
  Montserrat: ["Lora", "Playfair Display", "Source Serif 4"],
  "Playfair Display": ["Inter", "DM Sans", "Outfit"],
  Lora: ["Inter", "DM Sans", "Space Grotesk"],
  "DM Serif Display": ["DM Sans", "Inter", "Outfit"],
  "Source Serif 4": ["Inter", "Space Grotesk", "DM Sans"],
  "Space Mono": ["Inter", "DM Sans", "Outfit"],
  "JetBrains Mono": ["Inter", "DM Sans", "Space Grotesk"],
};

// ─── Rule Registry ────────────────────────────────────────────

const ALL_RULES: DesignRule[] = [
  ...contrastRules,
  ...typographyRules,
  ...harmonyRules,
];

// ─── Public API ───────────────────────────────────────────────

/**
 * Run all design rules against the current context.
 */
export function analyzeDesign(ctx: AnalysisContext): Suggestion[] {
  return ALL_RULES.flatMap((rule) => {
    try {
      return rule.analyze(ctx);
    } catch {
      return [];
    }
  });
}

/**
 * Compute a Design Health Score (0–100).
 * Starts at 100, deducts points per issue.
 */
export function computeHealthScore(suggestions: Suggestion[]): number {
  let score = 100;
  for (const s of suggestions) {
    switch (s.severity) {
      case "error":
        score -= 15;
        break;
      case "warning":
        score -= 8;
        break;
      case "info":
        score -= 3;
        break;
    }
  }
  return Math.max(0, Math.min(100, score));
}

/**
 * Get a health label + color for the score.
 */
export function getHealthLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 90) return { label: "Excellent", color: "green" };
  if (score >= 70) return { label: "Good", color: "blue" };
  if (score >= 50) return { label: "Needs Work", color: "orange" };
  return { label: "Critical", color: "red" };
}
