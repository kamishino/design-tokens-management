import { useState, useMemo, useCallback } from "react";
import type { TokenDoc } from "../utils/token-parser";

// ---------------------
// Command Types
// ---------------------

export type CommandCategory = "token" | "action" | "navigation";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: CommandCategory;
  icon?: string;
  /** Color swatch hex for token commands */
  swatch?: string;
  /** Action to execute when selected */
  action: () => void;
}

interface UseCommandPaletteOptions {
  tokens: TokenDoc[];
  onNavigateToken?: (token: TokenDoc) => void;
  onEnterStudio?: () => void;
  onOpenExport?: () => void;
}

// Simple fuzzy match: checks if all characters in query appear in target in order
const fuzzyMatch = (query: string, target: string): boolean => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
};

// Score: lower = better match. Prefers prefix matches and shorter targets.
const fuzzyScore = (query: string, target: string): number => {
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  if (t.startsWith(q)) return 0; // exact prefix = best
  if (t.includes(q)) return 1;   // substring = good
  return 2;                       // fuzzy = ok
};

export const useCommandPalette = ({
  tokens,
  onNavigateToken,
  onEnterStudio,
  onOpenExport,
}: UseCommandPaletteOptions) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Build static action commands
  const actionCommands = useMemo<CommandItem[]>(() => {
    const actions: CommandItem[] = [];

    if (onEnterStudio) {
      actions.push({
        id: "action:studio",
        label: "Open Design Studio",
        description: "Visual preview with templates",
        category: "action",
        icon: "🎨",
        action: () => {
          onEnterStudio();
          setIsOpen(false);
        },
      });
    }

    if (onOpenExport) {
      actions.push({
        id: "action:export",
        label: "Export for Tokens Studio",
        description: "Generate Figma-compatible JSON",
        category: "action",
        icon: "📦",
        action: () => {
          onOpenExport();
          setIsOpen(false);
        },
      });
    }

    return actions;
  }, [onEnterStudio, onOpenExport]);

  // Build token commands (lazy — only when palette is open and has query)
  const tokenCommands = useMemo<CommandItem[]>(() => {
    if (!isOpen || query.length < 2) return [];

    return tokens
      .filter((t) => fuzzyMatch(query, t.name))
      .sort((a, b) => fuzzyScore(query, a.name) - fuzzyScore(query, b.name))
      .slice(0, 20) // cap at 20 results
      .map((token) => ({
        id: `token:${token.id}`,
        label: token.name,
        description: `${token.type} · ${token.sourceFile}`,
        category: "token" as const,
        swatch:
          token.type === "color" && typeof token.resolvedValue === "string"
            ? token.resolvedValue
            : undefined,
        action: () => {
          onNavigateToken?.(token);
          setIsOpen(false);
        },
      }));
  }, [tokens, query, isOpen, onNavigateToken]);

  // Combined filtered results
  const results = useMemo<CommandItem[]>(() => {
    if (!query.trim()) {
      // No query: show all actions
      return actionCommands;
    }

    const filteredActions = actionCommands.filter((cmd) =>
      fuzzyMatch(query, cmd.label),
    );

    return [...filteredActions, ...tokenCommands];
  }, [query, actionCommands, tokenCommands]);

  const setQueryAndResetSelection = useCallback((value: string) => {
    setQuery(value);
    setSelectedIndex(0);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
  }, []);

  const executeSelected = useCallback(() => {
    const item = results[selectedIndex];
    if (item) item.action();
  }, [results, selectedIndex]);

  const moveSelection = useCallback(
    (direction: "up" | "down") => {
      setSelectedIndex((prev) => {
        if (direction === "up") return Math.max(0, prev - 1);
        return Math.min(results.length - 1, prev + 1);
      });
    },
    [results.length],
  );

  return {
    isOpen,
    query,
    setQuery: setQueryAndResetSelection,
    results,
    selectedIndex,
    open,
    close,
    executeSelected,
    moveSelection,
  };
};
