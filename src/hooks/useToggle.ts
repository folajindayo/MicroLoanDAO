import { useState, useCallback, useMemo } from 'react';

/**
 * Hook for boolean toggle state
 */
export function useToggle(initialValue: boolean = false): [
  boolean,
  () => void,
  { on: () => void; off: () => void; set: (value: boolean) => void }
] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const set = useCallback((v: boolean) => setValue(v), []);

  const setters = useMemo(() => ({ on, off, set }), [on, off, set]);
  return [value, toggle, setters];
}

/**
 * Hook for managing multiple toggle states
 */
export function useMultiToggle<T extends Record<string, boolean>>(
  initial: T
): {
  state: T;
  toggle: (key: keyof T) => void;
  setOn: (key: keyof T) => void;
  setOff: (key: keyof T) => void;
  set: (key: keyof T, value: boolean) => void;
  reset: () => void;
} {
  const [state, setState] = useState<T>(initial);

  const toggle = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setOn = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: true }));
  }, []);

  const setOff = useCallback((key: keyof T) => {
    setState(prev => ({ ...prev, [key]: false }));
  }, []);

  const set = useCallback((key: keyof T, value: boolean) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setState(initial), [initial]);

  return { state, toggle, setOn, setOff, set, reset };
}

export default useToggle;

