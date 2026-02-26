/**
 * useDesignAnalysis.ts
 *
 * Shared backbone hook for the Design System Assistant.
 * Powers all 3 features:
 *   - Health Score Card (score + label)
 *   - Inline Token Linter (violationsByVar map)
 *   - Analyzer Pro (full suggestions list)
 *
 * Debounced 300ms to avoid thrashing on every keystroke.
 */
import { useRef, useCallback, useState, useEffect } from "react";
import {
  analyzeDesign,
  computeHealthScore,
  getHealthLabel,
  type AnalysisContext,
  type Suggestion,
} from "../utils/design-rules";

// Semantic channel definitions (mirrors SEMANTIC_CHANNELS in ColorsTuning)
const SEMANTIC_CHANNELS = [
  {
    id: "primary",
    variable: "--brand-primary",
    label: "Primary",
    token: "brand.primary",
  },
  {
    id: "secondary",
    variable: "--brand-secondary",
    label: "Secondary",
    token: "brand.secondary",
  },
  {
    id: "accent",
    variable: "--brand-accent",
    label: "Accent",
    token: "brand.accent",
  },
  {
    id: "text",
    variable: "--text-primary",
    label: "Text",
    token: "text.primary",
  },
  {
    id: "bg",
    variable: "--bg-canvas",
    label: "Background",
    token: "bg.canvas",
  },
];

export interface DesignAnalysisResult {
  suggestions: Suggestion[];
  score: number;
  scoreLabel: string;
  scoreColor: string;
  /** Map from CSS variable name → suggestions that mention it */
  violationsByVar: Map<string, Suggestion[]>;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
}

interface UseDesignAnalysisOptions {
  overrides: Record<string, string | number>;
  getEffectiveValue: (
    cssVar: string,
    tokenKey: string,
    fallback: string,
  ) => string;
  /** Delay in ms before re-running analysis after changes (default 300) */
  debounceMs?: number;
}

export function useDesignAnalysis({
  overrides,
  getEffectiveValue,
  debounceMs = 300,
}: UseDesignAnalysisOptions): DesignAnalysisResult {
  const [result, setResult] = useState<DesignAnalysisResult>(() =>
    compute(buildContext(overrides, getEffectiveValue)),
  );

  // Keep a ref to the latest getEffectiveValue to avoid stale closures
  const getEffRef = useRef(getEffectiveValue);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync ref to latest getValue without triggering re-renders
  useEffect(() => {
    getEffRef.current = getEffectiveValue;
  });

  const runAnalysis = useCallback(() => {
    const ctx = buildContext(overrides, getEffRef.current);
    setResult(compute(ctx));
  }, [overrides]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runAnalysis, debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [runAnalysis, debounceMs]);

  return result;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildContext(
  overrides: Record<string, string | number>,
  getEffectiveValue: (
    cssVar: string,
    tokenKey: string,
    fallback: string,
  ) => string,
): AnalysisContext {
  const colorCtx = SEMANTIC_CHANNELS.map((c) => ({
    variable: c.variable,
    label: c.label,
    hex: getEffectiveValue(c.variable, c.token, "#000000"),
  }));

  return {
    colors: colorCtx,
    typography: {
      baseSize: Number(overrides["--font-size-root"]) || 16,
      scaleRatio: Number(overrides["--typography-config-scale-ratio"]) || 1.25,
      lineHeight: Number(overrides["--line-height-body"]) || 1.5,
      headingFont: (
        getEffectiveValue(
          "--font-family-heading",
          "font.family.heading",
          "Inter",
        ) || "Inter"
      )
        .split(",")[0]
        .replace(/['"]/g, "")
        .trim(),
      bodyFont: (
        getEffectiveValue("--font-family-base", "font.family.base", "Inter") ||
        "Inter"
      )
        .split(",")[0]
        .replace(/['"]/g, "")
        .trim(),
      codeFont: (
        getEffectiveValue(
          "--font-family-mono",
          "font.family.mono",
          "monospace",
        ) || "monospace"
      )
        .split(",")[0]
        .replace(/['"]/g, "")
        .trim(),
    },
  };
}

function compute(ctx: AnalysisContext): DesignAnalysisResult {
  const suggestions = analyzeDesign(ctx);
  const score = computeHealthScore(suggestions);
  const { label, color } = getHealthLabel(score);

  // Build violationsByVar: map CSS var → suggestions that involve it
  const violationsByVar = new Map<string, Suggestion[]>();

  for (const s of suggestions) {
    // If the suggestion has a fix, it's tied to that variable
    if (s.fix?.variable) {
      const v = s.fix.variable;
      if (!violationsByVar.has(v)) violationsByVar.set(v, []);
      violationsByVar.get(v)!.push(s);
    }
    // Also attribute to related color vars inferred from rule IDs
    const ruleToVars: Record<string, string[]> = {
      "contrast-text-on-bg": ["--text-primary", "--bg-canvas"],
      "contrast-primary-on-bg": ["--brand-primary"],
      "contrast-accent-on-bg": ["--brand-accent"],
      "harmony-hue-distance": ["--brand-primary", "--brand-accent"],
      "harmony-primary-secondary": ["--brand-primary", "--brand-secondary"],
      "harmony-lightness-balance": [
        "--brand-primary",
        "--brand-secondary",
        "--brand-accent",
      ],
    };
    const relatedVars = ruleToVars[s.ruleId] ?? [];
    for (const v of relatedVars) {
      if (!violationsByVar.has(v)) violationsByVar.set(v, []);
      const existing = violationsByVar.get(v)!;
      if (!existing.includes(s)) existing.push(s);
    }
  }

  return {
    suggestions,
    score,
    scoreLabel: label,
    scoreColor: color,
    violationsByVar,
    criticalCount: suggestions.filter((s) => s.severity === "error").length,
    warningCount: suggestions.filter((s) => s.severity === "warning").length,
    infoCount: suggestions.filter((s) => s.severity === "info").length,
  };
}
