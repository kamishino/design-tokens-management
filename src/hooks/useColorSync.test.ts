/** @vitest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useColorSync } from './useColorSync';
import { describe, it, expect } from 'vitest';

describe('useColorSync', () => {
  it('should initialize with correct coordinates', () => {
    const { result } = renderHook(() => useColorSync('#ff0000'));
    
    expect(result.current.coords.hex.toLowerCase()).toBe('#ff0000');
    expect(result.current.coords.hsl.h).toBe(0);
    expect(result.current.coords.oklch.l).toBeCloseTo(0.627, 2);
  });

  it('should update all coordinates from hex', () => {
    const { result } = renderHook(() => useColorSync('#ff0000'));
    
    act(() => {
      result.current.updateFromHex('#00ff00');
    });
    
    expect(result.current.coords.hex.toLowerCase()).toBe('#00ff00');
    expect(result.current.coords.hsl.h).toBe(120);
  });

  it('should update all coordinates from Oklch', () => {
    const { result } = renderHook(() => useColorSync('#000000'));
    
    act(() => {
      // White in Oklch
      result.current.updateFromOklch(1, 0, 0);
    });
    
    expect(result.current.coords.hex.toLowerCase()).toBe('#ffffff');
    expect(result.current.coords.hsl.l).toBe(100);
  });
});
