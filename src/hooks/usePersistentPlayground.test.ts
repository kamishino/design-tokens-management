/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePersistentPlayground } from './usePersistentPlayground';

describe('usePersistentPlayground (V2 Reducer)', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value.toString(); },
      clear: () => { store = {}; },
      removeItem: (key: string) => { delete store[key]; }
    };
  })();

  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should update overrides immediately but push history with debounce', () => {
    const { result } = renderHook(() => usePersistentPlayground());

    act(() => {
      result.current.updateOverride({ '--test': 'red' }, 'Action 1');
    });

    // Immediate state update
    expect(result.current.overrides['--test']).toBe('red');
    expect(result.current.canUndo).toBe(false); // History not pushed yet

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.canUndo).toBe(false); // First entry is at index 0, canUndo is index > 0
    
    act(() => {
      result.current.updateOverride({ '--test': 'blue' }, 'Action 2');
      vi.advanceTimersByTime(500);
    });

    expect(result.current.canUndo).toBe(true);
    expect(result.current.overrides['--test']).toBe('blue');
  });

  it('should undo and redo correctly', () => {
    const { result } = renderHook(() => usePersistentPlayground());

    act(() => {
      result.current.updateOverride({ '--c': '1' });
      vi.advanceTimersByTime(500);
      result.current.updateOverride({ '--c': '2' });
      vi.advanceTimersByTime(500);
    });

    expect(result.current.overrides['--c']).toBe('2');

    act(() => {
      result.current.undo();
    });
    expect(result.current.overrides['--c']).toBe('1');

    act(() => {
      result.current.redo();
    });
    expect(result.current.overrides['--c']).toBe('2');
  });
});