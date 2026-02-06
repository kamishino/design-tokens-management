import type { TokenDoc } from './token-parser';

export interface FileCategory {
  id: string; // filename
  title: string;
  tokens: TokenDoc[]; // Preserved order flat list
  totalCount: number;
}

export const formatFileName = (filename: string): string => {
  // Extract leaf name if it's a full path
  const leafName = filename.split('/').pop() || filename;
  const name = leafName.replace('.json', '');
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Groups tokens by file while preserving their original declaration order.
 * This version removes sub-category grouping for a flatter, more technical view.
 */
export const groupTokensByFile = (tokens: TokenDoc[], search: string = ''): FileCategory[] => {
  const searchTerm = search.toLowerCase();
  
  // 1. Filter based on search
  const filtered = tokens.filter(t => 
    t.name.toLowerCase().includes(searchTerm) || 
    (typeof t.value === 'string' && t.value.toLowerCase().includes(searchTerm)) ||
    (t.rawValue && t.rawValue.toLowerCase().includes(searchTerm))
  );

  // 2. Group by file (preserving order)
  const fileGroups: Record<string, FileCategory> = {};

  filtered.forEach(t => {
    const filename = t.sourceFile;
    if (!fileGroups[filename]) {
      fileGroups[filename] = {
        id: filename,
        title: formatFileName(filename),
        tokens: [],
        totalCount: 0
      };
    }

    const cat = fileGroups[filename];
    cat.tokens.push(t);
    cat.totalCount++;
  });

  // 3. Return results without alphabetical sorting
  // Note: We keep the order from 'tokens' array which was parsed in order
  return Object.values(fileGroups);
};