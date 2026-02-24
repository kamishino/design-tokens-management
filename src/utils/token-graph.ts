import type { TokenDoc } from "./token-parser";

/**
 * Post-processes a flat list of tokens to build a dependency graph.
 * Fills the 'dependents' field for each token based on others' 'references'.
 */
export const enrichTokensWithLineage = (tokens: TokenDoc[]): TokenDoc[] => {
  const idMap = new Map<string, TokenDoc>();
  const nameMap = new Map<string, TokenDoc[]>();

  const getPriority = (path?: string) => {
    if (!path) return 0;
    if (path.includes("/clients/")) return 3;
    if (path.includes("/global/alias/")) return 2;
    if (path.includes("/global/base/")) return 1;
    return 0;
  };

  // 1. Build ID Map for physical relationships (Dependents)
  tokens.forEach((t) => idMap.set(t.id, t));

  // 2. Build multi-value Name Map for shadowing resolution
  tokens.forEach((t) => {
    const name = t.name || t.id;
    if (!nameMap.has(name)) nameMap.set(name, []);
    nameMap.get(name)!.push(t);
  });

  // Sort each candidate list by priority (high to low)
  nameMap.forEach((list) => {
    list.sort((a, b) => getPriority(b.sourceFile) - getPriority(a.sourceFile));
  });

  // 3. Build reverse relationships (Dependents) using ID Map
  tokens.forEach((token) => {
    token.references.forEach((refName) => {
      // Find the parent by name in our prioritized map, skipping current token if shadowing
      const candidates = nameMap.get(refName) || [];
      const parent = candidates.find((c) => c.id !== token.id);

      if (parent) {
        // We use the parent's actual unique ID from the ID map to store dependents
        const parentInIdMap = idMap.get(parent.id);
        if (parentInIdMap && !parentInIdMap.dependents.includes(token.id)) {
          parentInIdMap.dependents.push(token.id);
        }
      }
    });
  });

  // 4. Calculate resolvedValue for each token using Name Map
  tokens.forEach((token) => {
    const enrichedToken = idMap.get(token.id);
    if (enrichedToken) {
      enrichedToken.resolvedValue = resolveTerminalValue(
        enrichedToken,
        nameMap,
      );
    }
  });

  // 5. Propagate types from parents to children if type is unknown
  tokens.forEach((token) => {
    const enrichedToken = idMap.get(token.id);
    if (
      enrichedToken &&
      (enrichedToken.type === "unknown" || !enrichedToken.type)
    ) {
      enrichedToken.type = resolveTerminalType(enrichedToken, nameMap);
    }
  });

  return Array.from(idMap.values());
};

/**
 * Recursively resolves the terminal type of a token reference chain.
 */
export const resolveTerminalType = (
  token: TokenDoc,
  nameMap: Map<string, TokenDoc[]>,
  depth = 0,
): string => {
  if (depth > 10 || token.references.length === 0) {
    return token.type || "unknown";
  }

  const firstRefName = token.references[0];
  const candidates = nameMap.get(firstRefName) || [];

  // Find valid parent: not self, and has a known type
  const parent = candidates.find(
    (c) => c.id !== token.id && c.type && c.type !== "unknown",
  );

  if (parent) {
    // If parent has a valid type, return it
    return parent.type;
  }

  // Fallback: try finding ANY parent to recurse, even if type is unknown yet
  const fallbackParent = candidates.find((c) => c.id !== token.id);
  if (fallbackParent) {
    return resolveTerminalType(fallbackParent, nameMap, depth + 1);
  }

  return token.type || "unknown";
};

/**
 * Recursively resolves the terminal value of a token reference chain using a name-based map.
 */
export const resolveTerminalValue = (
  token: TokenDoc,
  nameMap: Map<string, TokenDoc[]>,
  depth = 0,
): any => {
  if (depth > 10 || token.references.length === 0) {
    return token.value;
  }

  // References currently store raw names like "color.blue.500"
  const firstRefName = token.references[0];
  const candidates = nameMap.get(firstRefName) || [];

  // Find the highest priority definition that isn't the current token AND has a valid value
  const parent = candidates.find(
    (c) =>
      c.id !== token.id &&
      c.value !== undefined &&
      c.value !== null &&
      c.value !== "",
  );

  if (parent) {
    // If parent already has a resolved value (computed in a previous pass or bottom-up), use it.
    // Note: Since we compute top-down, we might need to recurse if it's not ready.
    // But to be safe and simple: just recurse.
    const result = resolveTerminalValue(parent, nameMap, depth + 1);

    // If the result is the same as the current value (no progress), return it to avoid loops
    if (result === token.value) return result;

    return result;
  }

  return token.value;
};

/**
 * Recursively resolves the terminal value using a single-priority map.
 */
export const resolveValueWithMap = (
  token: TokenDoc,
  tokenMap: Map<string, TokenDoc>,
  depth = 0,
): any => {
  if (depth > 10 || token.references.length === 0) {
    return token.value;
  }

  const firstRefName = token.references[0];
  const parent = tokenMap.get(firstRefName);

  if (parent && parent.id !== token.id) {
    const result = resolveValueWithMap(parent, tokenMap, depth + 1);
    if (result === token.value) return result;
    return result;
  }

  return token.value;
};

/**
 * Recursively resolves the full upstream lineage of a token using name-based lookup.
 */
export const getUpstreamLineage = (
  token: TokenDoc,
  nameMap: Map<string, TokenDoc[]>,
  depth = 0,
): TokenDoc[] => {
  if (depth > 5) return []; // Circular ref guard

  let lineage: TokenDoc[] = [];
  token.references.forEach((refName) => {
    const candidates = nameMap.get(refName) || [];
    const parent = candidates.find((c) => c.id !== token.id);
    if (parent) {
      lineage.push(parent);
      lineage = lineage.concat(getUpstreamLineage(parent, nameMap, depth + 1));
    }
  });

  return lineage;
};

/**

 * Finds the source file path for a given token ID.

 */

export const findSourceFileForToken = (
  tokenId: string,
  tokens: TokenDoc[],
): string | null => {
  const token = tokens.find((t) => t.id === tokenId);

  if (!token) return null;

  return token.sourceFile;
};

/**

 * Builds a Map of token names to docs, with priority: 

 * Project > Client > Global.

 */

export const getPrioritizedTokenMap = (
  tokens: TokenDoc[],
  targetPath: string,
): Map<string, TokenDoc> => {
  const tokenMap = new Map<string, TokenDoc>();

  // Sort tokens by priority (low to high so higher ones overwrite)

  const sorted = [...tokens].sort((a, b) => {
    const getPriority = (path: string) => {
      if (path.includes(targetPath.split("/projects/")[0] + "/projects/"))
        return 3; // Project

      if (path.includes(targetPath.split("/projects/")[0])) return 2; // Client

      if (path.includes("/global/")) return 1; // Global

      return 0;
    };

    return getPriority(a.sourceFile) - getPriority(b.sourceFile);
  });

  sorted.forEach((t) => tokenMap.set(t.name, t));

  return tokenMap;
};
