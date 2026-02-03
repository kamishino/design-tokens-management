import type { TokenDoc } from './token-parser';

export interface NavSection {
  title: string;
  items: string[];
}

export const generateDocNav = (tokens: TokenDoc[]): NavSection[] => {
  const groups: Record<string, Set<string>> = {};

  tokens.forEach(t => {
    const category = t.path[0];
    if (!groups[category]) groups[category] = new Set();
    groups[category].add(t.path[1] || 'base');
  });

  return Object.entries(groups).map(([title, items]) => ({
    title: title.charAt(0).toUpperCase() + title.slice(1),
    items: Array.from(items)
  }));
};