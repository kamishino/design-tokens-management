import type { TokenDoc } from './token-parser';

export interface SubCategory {
  id: string;
  name: string;
  tokens: TokenDoc[];
}

export interface FileCategory {
  id: string; // filename
  title: string;
  subCategories: SubCategory[];
  totalCount: number;
}

export const formatFileName = (filename: string): string => {
  const name = filename.replace('.json', '');
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const groupTokensByFile = (tokens: TokenDoc[], search: string = ''): FileCategory[] => {
  const searchTerm = search.toLowerCase();
  
  // 1. Filter
  const filtered = tokens.filter(t => 
    t.name.toLowerCase().includes(searchTerm) || 
    (typeof t.value === 'string' && t.value.toLowerCase().includes(searchTerm))
  );

  // 2. Group by file
  const fileGroups: Record<string, FileCategory> = {};

  filtered.forEach(t => {
    const filename = t.sourceFile;
    if (!fileGroups[filename]) {
      fileGroups[filename] = {
        id: filename,
        title: formatFileName(filename),
        subCategories: [],
        totalCount: 0
      };
    }

    const cat = fileGroups[filename];
    const subId = t.path[1] || 'general';
    
    let sub = cat.subCategories.find(s => s.id === subId);
    if (!sub) {
      sub = {
        id: subId,
        name: subId.charAt(0).toUpperCase() + subId.slice(1),
        tokens: []
      };
      cat.subCategories.push(sub);
    }

    sub.tokens.push(t);
    cat.totalCount++;
  });

  // 3. Sort and Cleanup
  return Object.values(fileGroups).map(cat => {
    // Sort subcategories: "general" or "base" first, then alphabetical
    cat.subCategories.sort((a, b) => {
      if (a.id === 'general' || a.id === 'base') return -1;
      if (b.id === 'general' || b.id === 'base') return 1;
      return a.name.localeCompare(b.name);
    });
    return cat;
  }).sort((a, b) => a.title.localeCompare(b.title));
};
