import { describe, it, expect } from 'vitest';
import { prependFont } from './fonts';

describe('Font Stack Logic', () => {
  it('should prepend a font to an empty or simple stack', () => {
    expect(prependFont('Inter', 'sans-serif')).toBe('Inter, sans-serif');
  });

  it('should not duplicate if font is already at the front', () => {
    expect(prependFont('Inter', 'Inter, sans-serif')).toBe('Inter, sans-serif');
  });

  it('should move font to front if it exists later in the stack', () => {
    expect(prependFont('Roboto', 'Inter, Roboto, sans-serif')).toBe('Roboto, Inter, sans-serif');
  });

  it('should handle complex stacks with quotes', () => {
    expect(prependFont('Open Sans', '"Open Sans", sans-serif')).toBe('"Open Sans", sans-serif');
  });
});
