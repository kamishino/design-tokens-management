import { useCallback, useEffect, useReducer, useRef } from 'react';

// --- Types ---

export interface HistoryEntry {
  overrides: Record<string, string | number>;
  label: string;
  timestamp: string;
}

export interface PlaygroundState {
  overrides: Record<string, string | number>;
  history: HistoryEntry[];
  currentIndex: number;
}

export type PlaygroundAction = 
  | { type: 'SET_OVERRIDES', payload: Record<string, string | number>, label?: string }
  | { type: 'PUSH_HISTORY', label?: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' }
  | { type: 'DISCARD_KEY', key: string }
  | { type: 'HYDRATE', payload: Partial<PlaygroundState> };

// --- Constants ---

const STORAGE_KEY = 'kami-design-playground-history-v2';
const MAX_HISTORY = 50;

const initialState: PlaygroundState = {
  overrides: {},
  history: [],
  currentIndex: -1
};

// --- Reducer ---

function playgroundReducer(state: PlaygroundState, action: PlaygroundAction): PlaygroundState {
  switch (action.type) {
    case 'SET_OVERRIDES': {
      return {
        ...state,
        overrides: { ...state.overrides, ...action.payload }
      };
    }

    case 'PUSH_HISTORY': {
      // Don't push if nothing has changed since last entry
      const lastEntry = state.history[state.currentIndex];
      if (lastEntry && JSON.stringify(lastEntry.overrides) === JSON.stringify(state.overrides)) {
        return state;
      }

      const newEntry: HistoryEntry = {
        overrides: { ...state.overrides },
        label: action.label || 'Update',
        timestamp: new Date().toISOString()
      };

      const newHistory = [...state.history.slice(0, state.currentIndex + 1), newEntry].slice(-MAX_HISTORY);
      
      return {
        ...state,
        history: newHistory,
        currentIndex: newHistory.length - 1
      };
    }

    case 'UNDO': {
      if (state.currentIndex > 0) {
        const nextIndex = state.currentIndex - 1;
        return {
          ...state,
          currentIndex: nextIndex,
          overrides: state.history[nextIndex].overrides
        };
      }
      return state;
    }

    case 'REDO': {
      if (state.currentIndex < state.history.length - 1) {
        const nextIndex = state.currentIndex + 1;
        return {
          ...state,
          currentIndex: nextIndex,
          overrides: state.history[nextIndex].overrides
        };
      }
      return state;
    }

    case 'RESET': {
      return initialState;
    }

    case 'DISCARD_KEY': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.key]: _discarded, ...rest } = state.overrides;
      return {
        ...state,
        overrides: rest
      };
    }

    case 'HYDRATE': {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
}

// --- Hook ---

export const usePersistentPlayground = () => {
  const [state, dispatch] = useReducer(playgroundReducer, initialState);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Hydration
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        dispatch({ type: 'HYDRATE', payload: parsed });
      } catch (e) {
        console.error('Failed to hydrate state', e);
      }
    }
  }, []);

  // 2. Persistence
  useEffect(() => {
    if (state.history.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        history: state.history,
        currentIndex: state.currentIndex
      }));
    }
  }, [state.history, state.currentIndex]);

  // 3. Inject CSS
  useEffect(() => {
    const styleId = 'token-playground-overrides';
    let styleTag = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const baseSize = Number(state.overrides['--fontSizeRoot']) || 16;
    const ratio = Number(state.overrides['--typographyConfigScaleRatio']) || 1.250;

    // Generate Derived Typography Scale (Step -2 to 8)
    const scaleRules: string[] = [];
    const steps = [
      { id: -2, name: 'Minus2' }, { id: -1, name: 'Minus1' }, { id: 0, name: '0' },
      { id: 1, name: '1' }, { id: 2, name: '2' }, { id: 3, name: '3' },
      { id: 4, name: '4' }, { id: 5, name: '5' }, { id: 6, name: '6' },
      { id: 7, name: '7' }, { id: 8, name: '8' }
    ];

    steps.forEach(step => {
      const exactPx = baseSize * Math.pow(ratio, step.id);
      const roundedPx = Math.round(exactPx);
      
      scaleRules.push(`  --fontSizeScale${step.name}: ${roundedPx}px !important;`);
    });

    const overrideRules = Object.entries(state.overrides)
      .map(([name, value]) => `  ${name}: ${value} !important;`)
      .join('\n');

    styleTag.innerHTML = `:root {\n${scaleRules.join('\n')}\n${overrideRules}\n}`;
  }, [state.overrides]);

  // 4. Stable Callbacks
  const updateOverride = useCallback((newValues: Record<string, string | number>, label?: string) => {
    // 4.1 Update UI immediately (Transient)
    dispatch({ type: 'SET_OVERRIDES', payload: newValues });

    // 4.2 Debounce History Push (Persistent)
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch({ type: 'PUSH_HISTORY', label });
    }, 500);
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const resetOverrides = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'RESET' });
  }, []);

  const discardOverride = useCallback((key: string) => {
    dispatch({ type: 'DISCARD_KEY', key });
    // Push to history so it's undoable
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      dispatch({ type: 'PUSH_HISTORY', label: `Discarded ${key}` });
    }, 100);
  }, []);

  return {
    overrides: state.overrides,
    history: state.history,
    updateOverride,
    discardOverride,
    undo,
    redo,
    resetOverrides,
    canUndo: state.currentIndex > 0,
    canRedo: state.currentIndex < state.history.length - 1
  };
};
