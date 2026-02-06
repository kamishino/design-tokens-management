import type { TokenDoc } from './token-parser';

/**
 * Post-processes a flat list of tokens to build a dependency graph.
 * Fills the 'dependents' field for each token based on others' 'references'.
 */
export const enrichTokensWithLineage = (tokens: TokenDoc[]): TokenDoc[] => {
  const tokenMap = new Map<string, TokenDoc>();
  tokens.forEach(t => tokenMap.set(t.id, t));

  // Build reverse relationships (Dependents)
  tokens.forEach(token => {
    token.references.forEach(refId => {
      const parent = tokenMap.get(refId);
      if (parent) {
        if (!parent.dependents.includes(token.id)) {
          parent.dependents.push(token.id);
        }
      }
    });
  });

  // Task 1.1: Calculate resolvedValue for each token
  tokens.forEach(token => {
    token.resolvedValue = resolveTerminalValue(token, tokenMap);
  });

  return tokens;
};

/**
 * Recursively resolves the terminal value of a token reference chain.
 */
export const resolveTerminalValue = (token: TokenDoc, tokenMap: Map<string, TokenDoc>, depth = 0): any => {
  if (depth > 10 || token.references.length === 0) {
    return token.value;
  }

  // Assuming single reference for now as per Style Dictionary standard
  const firstRefId = token.references[0];
  const parent = tokenMap.get(firstRefId);

  if (parent) {
    return resolveTerminalValue(parent, tokenMap, depth + 1);
  }

  return token.value;
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

  

  return token.sourceFile;

};
