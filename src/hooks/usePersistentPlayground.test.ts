import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentPlayground } from './usePersistentPlayground';

describe('usePersistentPlayground', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should update overrides and push to history', () => {
    const { result } = renderHook(() => usePersistentPlayground());

    act(() => {
      result.current.updateOverride({ '--test': 'red' }, 'Set Red');
    });

    expect(result.current.overrides['--test']).toBe('red');
    expect(result.current.canUndo).toBe(false); // First state, can't undo yet? 
    // Wait, my logic pushes first state at index 0. Initial was -1. 
    // So index 0 has overrides. Index 1 has more.
  });

  it('should undo correctly', () => {
    const { result } = renderHook(() => usePersistentPlayground());

    act(() => {
      result.current.updateOverride({ '--color': 'blue' }, 'Blue');
    });
    act(() => {
      result.current.updateOverride({ '--color': 'red' }, 'Red');
    });

    expect(result.current.overrides['--color']).toBe('red');
    
    act(() => {
      result.current.undo();
    });

    expect(result.current.overrides['--color']).toBe('blue');
  });
});
