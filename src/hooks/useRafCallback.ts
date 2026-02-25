import { useCallback, useLayoutEffect, useRef } from "react";

// Using `any` here is intentional — hook-level generics must accept
// any function signature so callers like (hex: string) => void can pass through.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => void;

/**
 * useRafCallback — Vercel Best Practice: Re-render Optimization
 *
 * Wraps a callback so it fires at most once per animation frame (~60fps).
 * If called multiple times before the frame fires, only the LAST call executes.
 */
export function useRafCallback<T extends AnyFn>(fn: T): T {
  const rafRef = useRef<number | null>(null);
  const latestFn = useRef<T>(fn);

  // Sync the latest fn reference in a layout effect, not during render
  useLayoutEffect(() => {
    latestFn.current = fn;
  });

  const throttled = useCallback(
    (...args: Parameters<T>) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        latestFn.current(...args);
      });
    },
    [], // stable reference — never re-creates on re-render
  ) as T;

  return throttled;
}

/**
 * useDebounceCallback — pairs with useRafCallback for flushing expensive
 * global state writes after the user stops interacting.
 */
export function useDebounceCallback<T extends AnyFn>(
  fn: T,
  delayMs: number,
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFn = useRef<T>(fn);

  useLayoutEffect(() => {
    latestFn.current = fn;
  });

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        latestFn.current(...args);
      }, delayMs);
    },
    [delayMs],
  ) as T;

  return debounced;
}
