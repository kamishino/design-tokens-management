import type { TokenDoc } from './token-parser';

/**
 * Post-processes a flat list of tokens to build a dependency graph.
 * Fills the 'dependents' field for each token based on others' 'references'.
 */
export const enrichTokensWithLineage = (tokens: TokenDoc[]): TokenDoc[] => {
  // 1. Create a quick lookup map by ID
  const tokenMap = new Map<string, TokenDoc>();
  tokens.forEach(t => tokenMap.set(t.id, t));

  // 2. Build reverse relationships (Dependents)
  tokens.forEach(token => {
    token.references.forEach(refId => {
      const parent = tokenMap.get(refId);
      if (parent) {
        // If this parent is found, add the current token as its dependent
        if (!parent.dependents.includes(token.id)) {
          parent.dependents.push(token.id);
        }
      }
    });
  });

  return tokens;
};

/**
 * Recursively resolves the full upstream lineage of a token.
 */
export const getUpstreamLineage = (token: TokenDoc, tokenMap: Map<string, TokenDoc>, depth = 0): TokenDoc[] => {
  if (depth > 5) return []; // Circular ref guard
  
  let lineage: TokenDoc[] = [];
  token.references.forEach(refId => {
    const parent = tokenMap.get(refId);
    if (parent) {
      lineage.push(parent);
      lineage = lineage.concat(getUpstreamLineage(parent, tokenMap, depth + 1));
    }
  });
  
  return lineage;
};

/**
 * Finds the source file path for a given token ID.
 */
export const findSourceFileForToken = (tokenId: string, tokens: TokenDoc[]): string | null => {
  const token = tokens.find(t => t.id === tokenId);
  if (!token) return null;
  
  // Map simple filename to full explorer path
  const isBase = token.sourceFile !== 'colors.json' && token.sourceFile !== 'typography.json';
  const prefix = isBase ? 'global/base' : 'global/alias';
  
  return `${prefix}/${token.sourceFile}`;
};
