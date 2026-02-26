/**
 * varToTokenKey.ts
 *
 * Maps CSS custom property names (e.g. "--brand-primary") to:
 *   - tokenPath: dot-path in the JSON file (e.g. "brand.primary")
 *   - file:      URL-style path relative to project root (e.g. "/tokens/global/alias/colors.json")
 *   - type:      W3C DTCG $type value for this token (e.g. "color", "fontFamilies", etc.)
 *
 * Used by /api/save-tuning to know where to write each override.
 *
 * Save-destination strategy:
 *   1. If a client project file is active (path contains "/clients/"), ALL overrides
 *      are written to that file — acting as an override layer on top of globals.
 *      This is the expected behavior: "I selected project X, save changes TO project X".
 *   2. If no client file is active (global or no project selected), each var is written
 *      to its respective global file (alias/colors, base/typography, etc.).
 */

export interface TokenMapping {
  /** Dot-path inside the JSON file (e.g. "brand.primary") */
  tokenPath: string;
  /** URL-path relative to project root (e.g. "/tokens/global/alias/colors.json") */
  file: string;
  /** W3C DTCG $type — used when creating new token nodes */
  type: string;
  /** Optional human-readable label */
  label?: string;
}

/**
 * Global fallback mappings — used when no client project file is active.
 * Each entry specifies the global file that owns this token by default.
 */
export const GLOBAL_VAR_MAP: Record<string, TokenMapping> = {
  // ── Brand colors (global alias/colors.json) ──
  "--brand-primary": {
    tokenPath: "brand.primary",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Brand Primary",
  },
  "--brand-secondary": {
    tokenPath: "brand.secondary",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Brand Secondary",
  },
  "--brand-accent": {
    tokenPath: "brand.accent",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Brand Accent",
  },

  // ── Semantic colors (global alias/colors.json) ──
  "--text-primary": {
    tokenPath: "text.primary",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Text Primary",
  },
  "--text-secondary": {
    tokenPath: "text.secondary",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Text Secondary",
  },
  "--bg-canvas": {
    tokenPath: "bg.canvas",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Background Canvas",
  },
  "--bg-surface": {
    tokenPath: "bg.surface",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Background Surface",
  },
  "--border-default": {
    tokenPath: "border.default",
    file: "/tokens/global/alias/colors.json",
    type: "color",
    label: "Border Default",
  },

  // ── Typography scale ratio (global alias/typography.json) ──
  "--typography-config-scale-ratio": {
    tokenPath: "typography.config.scale-ratio",
    file: "/tokens/global/alias/typography.json",
    type: "number",
    label: "Type Scale Ratio",
  },

  // ── Font families (global base/typography.json) ──
  "--font-family-heading": {
    tokenPath: "font.family.heading",
    file: "/tokens/global/base/typography.json",
    type: "fontFamilies",
    label: "Heading Font",
  },
  "--font-family-base": {
    tokenPath: "font.family.base",
    file: "/tokens/global/base/typography.json",
    type: "fontFamilies",
    label: "Body Font",
  },
  "--font-family-mono": {
    tokenPath: "font.family.mono",
    file: "/tokens/global/base/typography.json",
    type: "fontFamilies",
    label: "Mono Font",
  },

  // ── Font weights (global base/typography.json) ──
  "--font-weight-heading": {
    tokenPath: "font.weight.heading",
    file: "/tokens/global/base/typography.json",
    type: "fontWeights",
    label: "Heading Weight",
  },
  "--font-weight-body": {
    tokenPath: "font.weight.body",
    file: "/tokens/global/base/typography.json",
    type: "fontWeights",
    label: "Body Weight",
  },

  // ── Line heights (global base/typography.json) ──
  "--line-height-heading": {
    tokenPath: "font.line-height.heading",
    file: "/tokens/global/base/typography.json",
    type: "lineHeights",
    label: "Heading Line Height",
  },
  "--line-height-body": {
    tokenPath: "font.line-height.body",
    file: "/tokens/global/base/typography.json",
    type: "lineHeights",
    label: "Body Line Height",
  },

  // ── Letter spacing (global base/typography.json) ──
  "--letter-spacing-heading": {
    tokenPath: "font.letter-spacing.heading",
    file: "/tokens/global/base/typography.json",
    type: "letterSpacing",
    label: "Heading Letter Spacing",
  },
  "--letter-spacing-body": {
    tokenPath: "font.letter-spacing.body",
    file: "/tokens/global/base/typography.json",
    type: "letterSpacing",
    label: "Body Letter Spacing",
  },

  // ── Font size root (global base/typography.json) ──
  "--font-size-root": {
    tokenPath: "font.size.root",
    file: "/tokens/global/base/typography.json",
    type: "fontSizes",
    label: "Root Font Size",
  },
};

/**
 * Checks if a path looks like a client-specific project file.
 * e.g. "/tokens/clients/brand-a/theme.json" → true
 */
function isClientProjectFile(projectFile?: string): boolean {
  if (!projectFile) return false;
  return projectFile.includes("/clients/") && projectFile.endsWith(".json");
}

/**
 * Resolve the token mapping for a CSS variable.
 *
 * Strategy:
 * - If `projectFile` is a client theme file → write ALL overrides to that file.
 *   The tokenPath stays the same (e.g. "brand.primary"), only the destination
 *   file changes. This allows the client theme.json to act as a complete
 *   override layer without touching global files.
 * - Otherwise → use the default global file from GLOBAL_VAR_MAP.
 */
export function resolveMapping(
  cssVar: string,
  projectFile?: string,
): TokenMapping | null {
  const global = GLOBAL_VAR_MAP[cssVar];
  if (!global) return null;

  // When a client project file is active: redirect ALL tokens to it
  if (isClientProjectFile(projectFile)) {
    return { ...global, file: projectFile! };
  }

  return global;
}

/** Returns all CSS vars that have a known mapping */
export function getMappedVars(): string[] {
  return Object.keys(GLOBAL_VAR_MAP);
}
