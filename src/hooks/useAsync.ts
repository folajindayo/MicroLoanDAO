import { useState, useCallback, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncReturn<T, P extends unknown[]> extends AsyncState<T> {
  execute: (...args: P) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook for managing async operations
 */
export function useAsync<T, P extends unknown[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  immediate: boolean = false
): UseAsyncReturn<T, P> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null, error: null, isLoading: immediate, isSuccess: false, isError: false,
  });

  const mountedRef = useRef(true);
  const asyncFunctionRef = useRef(asyncFunction);
  
  useEffect(() => { asyncFunctionRef.current = asyncFunction; }, [asyncFunction]);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);

  const execute = useCallback(async (...args: P): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, isSuccess: false, isError: false, error: null }));

    try {
      const result = await asyncFunctionRef.current(...args);
      if (mountedRef.current) {
        setState({ data: result, error: null, isLoading: false, isSuccess: true, isError: false });
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (mountedRef.current) {
        setState({ data: null, error, isLoading: false, isSuccess: false, isError: true });
      }
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false, isSuccess: false, isError: false });
  }, []);

  useEffect(() => {
    if (immediate) execute(...([] as unknown as P));
  }, [immediate, execute]);

  return { ...state, execute, reset };
}

/**
 * Hook for async operations with retry logic
 */
export function useAsyncRetry<T, P extends unknown[] = []>(
  asyncFunction: (...args: P) => Promise<T>,
  maxRetries: number = 3,
  retryDelay: number = 1000
): UseAsyncReturn<T, P> & { retryCount: number } {
  const [retryCount, setRetryCount] = useState(0);
  const asyncState = useAsync(asyncFunction);

  const executeWithRetry = useCallback(async (...args: P): Promise<T | null> => {
    let attempts = 0;
    while (attempts <= maxRetries) {
      const result = await asyncState.execute(...args);
      if (asyncState.isSuccess || result !== null) {
        setRetryCount(attempts);
        return result;
      }
      attempts++;
      if (attempts <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
      }
    }
    setRetryCount(attempts);
    return null;
  }, [asyncState, maxRetries, retryDelay]);

  return { ...asyncState, execute: executeWithRetry, retryCount };
}

export default useAsync;

