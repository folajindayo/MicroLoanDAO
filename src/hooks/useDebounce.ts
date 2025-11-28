import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce a value with configurable delay
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Create a debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 500
): {
  debouncedCallback: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const argsRef = useRef<Parameters<T> | null>(null);

  callbackRef.current = callback;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      cancel();
      callbackRef.current(...argsRef.current);
      argsRef.current = null;
    }
  }, [cancel]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      cancel();
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        argsRef.current = null;
      }, delay);
    },
    [delay, cancel]
  );

  useEffect(() => () => cancel(), [cancel]);

  return { debouncedCallback, cancel, flush };
}

/**
 * Debounce state updates
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 500
): [T, (value: T) => void, T] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(immediateValue, delay);
  return [debouncedValue, setImmediateValue, immediateValue];
}

export default useDebounce;

