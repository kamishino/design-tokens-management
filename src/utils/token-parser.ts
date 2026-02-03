/**
 * Utility to flatten deep token JSON into a flat array for documentation.
 */
export interface TokenDoc {
  id: string;
  name: string;
  path: string[];
  value: any;
  type: string;
  description?: string;
  cssVariable: string;
  jsPath: string;
  sourceFile: string; // origin file like "colors.json"
}

export const parseTokensToDocs = (obj: any, path: string[] = [], sourceFile: string = ''): TokenDoc[] => {
  let results: TokenDoc[] = [];

  for (const key in obj) {
    const currentPath = [...path, key];
    const value = obj[key];

    if (value && typeof value === 'object') {
      if (value.$value !== undefined || value.value !== undefined) {
        const val = value.$value !== undefined ? value.$value : value.value;
        const type = value.$type || value.type || 'unknown';
        
        // Refined naming logic to match Style Dictionary camelCase
        const cssVarName = currentPath
          .map((part, index) => {
            if (index === 0) return part.toLowerCase();
            return part.charAt(0).toUpperCase() + part.slice(1);
          })
          .join('')
          .replace(/[^a-zA-Z0-9]/g, '');

        results.push({
          id: currentPath.join('.'),
          name: currentPath.join('.'),
          path: currentPath,
          value: val,
          type,
          description: value.$description || value.description,
          cssVariable: `--${cssVarName}`,
          jsPath: `tokens.${currentPath.join('.')}`,
          sourceFile
        });
      } else {
        results = results.concat(parseTokensToDocs(value, currentPath, sourceFile));
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
    s.value.toLowerCase() === target
  ) || null;
};
