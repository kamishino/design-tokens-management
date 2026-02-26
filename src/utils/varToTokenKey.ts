/**
 * varToTokenKey.ts
 *
 * Maps CSS custom property names (e.g. "--brand-primary") to:
 *   - tokenPath: dot-path in the JSON file (e.g. "brand.primary")
 *   - file:      URL-style path relative to project root (e.g. "/tokens/global/alias/colors.json")
 *
 * Used by /api/save-tuning to know where to write each override.
 *
 * When a project-specific theme.json is selected, overrides for brand.*
 * tokens are written to that client file instead of the global alias.
 */

export interface TokenMapping {
  /** Dot-path inside the JSON file (e.g. "brand.primary") */
  tokenPath: string;
  /** URL-path relative to project root (e.g. "/tokens/global/alias/colors.json") */
  file: string;
  /** Optional human-readable label */
  label?: string;
}

/**
 * Global alias mappings — shared across all projects.
 * These are the source-of-truth paths in /tokens/global/alias/*.json
 */
export const GLOBAL_VAR_MAP: Record<string, TokenMapping> = {
  // ── Brand colors (global alias/colors.json) ──
  "--brand-primary": {
    tokenPath: "brand.primary",
    file: "/tokens/global/alias/colors.json",
    label: "Brand Primary",
  },
  "--brand-secondary": {
    tokenPath: "brand.secondary",
    file: "/tokens/global/alias/colors.json",
    label: "Brand Secondary",
  },
  "--brand-accent": {
    tokenPath: "brand.accent",
    file: "/tokens/global/alias/colors.json",
    label: "Brand Accent",
  },

  // ── Semantic colors (global alias/colors.json) ──
  "--text-primary": {
    tokenPath: "text.primary",
    file: "/tokens/global/alias/colors.json",
    label: "Text Primary",
  },
  "--text-secondary": {
    tokenPath: "text.secondary",
    file: "/tokens/global/alias/colors.json",
    label: "Text Secondary",
  },
  "--bg-canvas": {
    tokenPath: "bg.canvas",
    file: "/tokens/global/alias/colors.json",
    label: "Background Canvas",
  },
  "--bg-surface": {
    tokenPath: "bg.surface",
    file: "/tokens/global/alias/colors.json",
    label: "Background Surface",
  },
  "--border-default": {
    tokenPath: "border.default",
    file: "/tokens/global/alias/colors.json",
    label: "Border Default",
  },

  // ── Typography (global alias/typography.json) ──
  "--typography-config-scale-ratio": {
    tokenPath: "typography.config.scale-ratio",
    file: "/tokens/global/alias/typography.json",
    label: "Type Scale Ratio",
  },

  // ── Font families (global base/typography.json) ──
  "--font-family-heading": {
    tokenPath: "font.family.heading",
    file: "/tokens/global/base/typography.json",
    label: "Heading Font",
  },
  "--font-family-base": {
    tokenPath: "font.family.base",
    file: "/tokens/global/base/typography.json",
    label: "Body Font",
  },
  "--font-family-mono": {
    tokenPath: "font.family.mono",
    file: "/tokens/global/base/typography.json",
    label: "Mono Font",
  },

  // ── Font weights (global base/typography.json) ──
  "--font-weight-heading": {
    tokenPath: "font.weight.heading",
    file: "/tokens/global/base/typography.json",
    label: "Heading Weight",
  },
  "--font-weight-body": {
    tokenPath: "font.weight.body",
    file: "/tokens/global/base/typography.json",
    label: "Body Weight",
  },

  // ── Line heights (global base/typography.json) ──
  "--line-height-heading": {
    tokenPath: "font.line-height.heading",
    file: "/tokens/global/base/typography.json",
    label: "Heading Line Height",
  },
  "--line-height-body": {
    tokenPath: "font.line-height.body",
    file: "/tokens/global/base/typography.json",
    label: "Body Line Height",
  },

  // ── Letter spacing (global base/typography.json) ──
  "--letter-spacing-heading": {
    tokenPath: "font.letter-spacing.heading",
    file: "/tokens/global/base/typography.json",
    label: "Heading Letter Spacing",
  },
  "--letter-spacing-body": {
    tokenPath: "font.letter-spacing.body",
    file: "/tokens/global/base/typography.json",
    label: "Body Letter Spacing",
  },

  // ── Font size root (global base/typography.json) ──
  "--font-size-root": {
    tokenPath: "font.size.root",
    file: "/tokens/global/base/typography.json",
    label: "Root Font Size",
  },
};

/**
 * Resolve the token mapping for a CSS variable.
 *
 * If `projectFile` is a client theme file (e.g. /tokens/clients/brand-a/theme.json),
 * brand.* tokens are redirected to that file so overrides land in the project-specific
 * file rather than the global alias.
 */
export function resolveMapping(
  cssVar: string,
  projectFile?: string,
): TokenMapping | null {
  const global = GLOBAL_VAR_MAP[cssVar];
  if (!global) return null;

  // Redirect brand.* writes to the client theme file if one is active
  if (
    projectFile &&
    projectFile.includes("/clients/") &&
    projectFile.endsWith(".json") &&
    global.tokenPath.startsWith("brand.")
  ) {
    return { ...global, file: projectFile };
  }

  return global;
}

/** Returns all CSS vars that have a known mapping */
export function getMappedVars(): string[] {
  return Object.keys(GLOBAL_VAR_MAP);
}
