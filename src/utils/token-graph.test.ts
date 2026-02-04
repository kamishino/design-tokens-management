import { describe, it, expect } from 'vitest';
import { enrichTokensWithLineage } from './token-graph';
import type { TokenDoc } from './token-parser';

describe('enrichTokensWithLineage', () => {
  it('should link aliases to primitives as dependents', () => {
    const tokens: Partial<TokenDoc>[] = [
      { id: 'color.blue.600', references: [], dependents: [] },
      { id: 'brand.primary', references: ['color.blue.600'], dependents: [] },
      { id: 'text.link', references: ['brand.primary'], dependents: [] }
    ];

    const enriched = enrichTokensWithLineage(tokens as TokenDoc[]);
    
    const blue = enriched.find(t => t.id === 'color.blue.600');
    const primary = enriched.find(t => t.id === 'brand.primary');

    expect(blue?.dependents).toContain('brand.primary');
    expect(primary?.dependents).toContain('text.link');
  });
});
