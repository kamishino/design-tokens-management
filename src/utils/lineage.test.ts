import { describe, it, expect } from 'vitest';
import { resolveLineage } from './lineage';

describe('Lineage Resolver', () => {
  it('should build correct glob patterns for a nested project', () => {
    const lineage = resolveLineage('brand-a/app-1');
    
    expect(lineage).toContain('tokens/global/**/*.json');
    expect(lineage).toContain('tokens/clients/brand-a/*.json');
    expect(lineage).toContain('tokens/clients/brand-a/projects/app-1/*.json');
  });

  it('should maintain the correct priority order (Global -> Client -> Project)', () => {
    const lineage = resolveLineage('brand-a/app-1');
    
    expect(lineage[0]).toBe('tokens/global/**/*.json');
    expect(lineage[lineage.length - 1]).toBe('tokens/clients/brand-a/projects/app-1/*.json');
  });
});
