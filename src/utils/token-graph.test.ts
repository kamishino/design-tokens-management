import { describe, it, expect } from 'vitest';
import { enrichTokensWithLineage } from './token-graph';
import type { TokenDoc } from './token-parser';

describe('enrichTokensWithLineage', () => {
  it('should link aliases to primitives as dependents', () => {
    const tokens: Partial<TokenDoc>[] = [
      { id: 'color.blue.600', references: [], dependents: [], value: '#blue' },
      { id: 'brand.primary', references: ['color.blue.600'], dependents: [], value: '{color.blue.600}' },
      { id: 'text.link', references: ['brand.primary'], dependents: [], value: '{brand.primary}' }
    ];

    const enriched = enrichTokensWithLineage(tokens as TokenDoc[]);
    
    const blue = enriched.find(t => t.id === 'color.blue.600');
    const primary = enriched.find(t => t.id === 'brand.primary');
    const link = enriched.find(t => t.id === 'text.link');

    expect(blue?.dependents).toContain('brand.primary');
    expect(primary?.dependents).toContain('text.link');
    
    // Deep resolution check
    expect(primary?.resolvedValue).toBe('#blue');
    expect(link?.resolvedValue).toBe('#blue');
  });
});