import type { TokenDoc } from "../token-parser";
import type { TokenOverrides } from "../../schemas/manifest";

/**
 * Merges a prioritized TokenMap and active Overrides into a deep JSON tree
 * compatible with Figma Tokens Studio (W3C format).
 */
export const exportToTokensStudio = (
  tokenMap: Map<string, TokenDoc>,
  overrides: TokenOverrides,
): string => {
  const result: Record<string, unknown> = {};

  // 1. Rebuild the base tree from the prioritized map
  tokenMap.forEach((token) => {
    let current: Record<string, unknown> = result;
    token.path.forEach((part, index) => {
      // If it's the leaf node
      if (index === token.path.length - 1) {
        // Use override if exists, otherwise prioritized resolved value
        const overridenValue = overrides[token.cssVariable];
        const finalValue =
          overridenValue !== undefined
            ? overridenValue
            : token.resolvedValue || token.value;

        current[part] = {
          $value: finalValue,
          $type: token.type,
          ...(token.description ? { $description: token.description } : {}),
        };
      } else {
        // Navigate or create intermediate nodes
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part] as Record<string, unknown>;
      }
    });
  });

  return JSON.stringify(result, null, 2);
};

/**
 * Triggers a browser download of the generated JSON.
 */
export const downloadJson = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
