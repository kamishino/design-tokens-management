import { useState, useCallback } from 'react';

const STORAGE_KEY = 'design-tokens-recent-colors';

export const useRecentColors = (maxItems: number = 20) => {
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse recent colors', e);
      }
    }
    return [];
  });

  const addColor = useCallback((hex: string) => {
    if (!hex) return;
    
    setRecentColors(prev => {
      const filtered = prev.filter(c => c.toLowerCase() !== hex.toLowerCase());
      const updated = [hex.toUpperCase(), ...filtered].slice(0, maxItems);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [maxItems]);

  const clear = useCallback(() => {
    setRecentColors([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    recentColors,
    addColor,
    clear
  };
};
