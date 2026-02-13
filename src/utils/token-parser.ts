/**
 * Utility to flatten deep token JSON into a flat array for documentation.
 */
export interface TokenDoc {
  id: string;
  name: string;
  path: string[];
  value: string | number | boolean | object;
  rawValue?: string;      // The raw {ref} string if it exists
  references: string[];   // Upstream token IDs (what this token points to)
  dependents: string[];   // Downstream token IDs (what points to this token - computed later)
  type: string;
  description?: string;
  cssVariable: string;
  jsPath: string;
  sourceFile: string;     // origin file like "colors.json"
  resolvedValue?: string | number | boolean | object;    // The final resolved value after following reference chains
  lineage?: string[];     // Array of token IDs involved in resolution
}

/**
 * Extracts reference IDs from a token value string.
 * Example: "{color.blue.600}" -> ["color.blue.600"]
 */
export const extractReferences = (value: string | number | boolean | object): string[] => {
  if (typeof value !== 'string') return [];
  const regex = /\{([^}]+)\}/g;
  const refs: string[] = [];
  let match;
  while ((match = regex.exec(value)) !== null) {
    refs.push(match[1]);
  }
  return refs;
};

export const parseTokensToDocs = (obj: Record<string, unknown>, path: string[] = [], sourceFile: string = ''): TokenDoc[] => {
  let results: TokenDoc[] = [];

  for (const key in obj) {
    const currentPath = [...path, key];
    const value = obj[key];

    if (value && typeof value === 'object') {
      const v = value as any;
      if (v.$value !== undefined || v.value !== undefined) {
        const val = v.$value !== undefined ? v.$value : v.value;
        const type = v.$type || v.type || 'unknown';

        // Extract references
        const refs = extractReferences(val);

        // Refined naming logic to match Style Dictionary camelCase
        const cssVarName = currentPath
          .map((part, index) => {
            if (index === 0) return part.toLowerCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join('')
          .replace(/[^a-zA-Z0-9]/g, '');

        results.push({
          id: `${sourceFile}:${currentPath.join('.')}`,
          name: currentPath.join('.'),
          path: currentPath,
          value: val,
          rawValue: typeof val === 'string' && val.includes('{') ? val : undefined,
          references: refs,
          dependents: [], // Initialized empty
          type,
          description: v.$description || v.description,
          cssVariable: `--${cssVarName}`,
          jsPath: `tokens.${currentPath.join('.')}`,
          sourceFile
        });
      } else {
        results = results.concat(parseTokensToDocs(v, currentPath, sourceFile));
      }
    }
  }

  return results;
};

export const findReference = (hex: string, swatches: TokenDoc[]): TokenDoc | null => {
  if (!hex) return null;
  const target = hex.toLowerCase();
  return swatches.find(s =>
    s.type === 'color' &&
    typeof s.value === 'string' &&
    String(s.value).toLowerCase() === target
  ) || null;
};