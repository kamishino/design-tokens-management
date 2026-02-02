import { useState, useEffect, useCallback } from 'react';

export interface HistoryState {
  overrides: Record<string, string | number>;
  label: string;
  timestamp: string;
}

const STORAGE_KEY = 'kami-design-playground-history';
const MAX_HISTORY = 50;

export const usePersistentPlayground = () => {
  const [overrides, setOverrides] = useState<Record<string, string | number>>({});
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { history: savedHistory, currentIndex: savedIndex } = JSON.parse(saved);
        setHistory(savedHistory);
        setCurrentIndex(savedIndex);
        if (savedIndex >= 0) {
          setOverrides(savedHistory[savedIndex].overrides);
        }
      } catch (e) {
        console.error('Failed to load history from localStorage', e);
      }
    }
  }, []);

  // Save to LocalStorage whenever history changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history, currentIndex }));
    }
  }, [history, currentIndex]);

  // Inject Styles to :root
  useEffect(() => {
    const styleId = 'token-playground-overrides';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `:root {\n${Object.entries(overrides)
      .map(([name, value]) => `  ${name}: ${value} !important;`)
      .join('\n')}\n}`;
  }, [overrides]);

  const updateOverride = useCallback((newOverrides: Record<string, string | number>, label = 'Update') => {
    setOverrides(prev => {
      const updated = { ...prev, ...newOverrides };
      
      const newState: HistoryState = {
        overrides: updated,
        label,
        timestamp: new Date().toISOString()
      };

      const newHistory = [...history.slice(0, currentIndex + 1), newState].slice(-MAX_HISTORY);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      
      return updated;
    });
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setOverrides(history[prevIndex].overrides);
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setOverrides(history[nextIndex].overrides);
    }
  }, [currentIndex, history]);

  const resetOverrides = useCallback(() => {
    setOverrides({});
    setHistory([]);
    setCurrentIndex(-1);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { 
    overrides, 
    updateOverride, 
    undo, 
    redo, 
    resetOverrides, 
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    history
  };
};