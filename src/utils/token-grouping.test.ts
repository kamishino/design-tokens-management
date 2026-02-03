import { describe, it, expect } from 'vitest';
import { groupTokensByFile, formatFileName } from './token-grouping';
import type { TokenDoc } from './token-parser';

describe('File-First Grouping Logic', () => {
  const mockTokens: TokenDoc[] = [
    { id: '1', name: 'color.neutral.50', path: ['color', 'neutral', '50'], value: '#f4f4f4', type: 'color', cssVariable: '--color-neutral-50', jsPath: 'color.neutral.50', sourceFile: 'colors.json' },
    { id: '2', name: 'color.blue.500', path: ['color', 'blue', '500'], value: '#0000ff', type: 'color', cssVariable: '--color-blue-500', jsPath: 'color.blue.500', sourceFile: 'colors.json' },
    { id: '3', name: 'spacing.base', path: ['spacing', 'base'], value: '4px', type: 'spacing', cssVariable: '--spacing-base', jsPath: 'spacing.base', sourceFile: 'spacing.json' },
    { id: '4', name: 'grid.columns', path: ['grid', 'columns'], value: 12, type: 'number', cssVariable: '--grid-columns', jsPath: 'grid.columns', sourceFile: 'grid.json' }
  ];

  it('should format file names correctly', () => {
    expect(formatFileName('colors.json')).toBe('Colors');
    expect(formatFileName('z-index.json')).toBe('Z Index');
  });

  it('should group tokens by source file', () => {
    const categories = groupTokensByFile(mockTokens);
    expect(categories).toHaveLength(3); // colors, spacing, grid
    expect(categories.find(c => c.id === 'colors.json')).toBeDefined();
  });

  it('should group sub-categories within files', () => {
    const categories = groupTokensByFile(mockTokens);
    const colorCat = categories.find(c => c.id === 'colors.json');
    expect(colorCat?.subCategories).toHaveLength(2); // neutral, blue
  });
});