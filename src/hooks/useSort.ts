import { useState, useMemo, useCallback } from 'react';

type SortDirection = 'asc' | 'desc' | null;

interface UseSortReturn<T, K extends keyof T> {
  sortedData: T[];
  sortKey: K | null;
  sortDirection: SortDirection;
  sort: (key: K) => void;
  resetSort: () => void;
  isSorted: (key: K) => boolean;
  getSortDirection: (key: K) => SortDirection;
}

/**
 * Default comparator for sorting
 */
function defaultComparator<T>(a: T, b: T, key: keyof T): number {
  const aVal = a[key];
  const bVal = b[key];

  if (aVal === null || aVal === undefined) return 1;
  if (bVal === null || bVal === undefined) return -1;

  if (typeof aVal === 'string' && typeof bVal === 'string') {
    return aVal.localeCompare(bVal);
  }

  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return aVal - bVal;
  }

  if (typeof aVal === 'bigint' && typeof bVal === 'bigint') {
    return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
  }

  if (aVal instanceof Date && bVal instanceof Date) {
    return aVal.getTime() - bVal.getTime();
  }

  return String(aVal).localeCompare(String(bVal));
}

/**
 * Hook for sorting data
 */
export function useSort<T, K extends keyof T = keyof T>(
  data: T[],
  options: {
    initialSortKey?: K;
    initialDirection?: SortDirection;
    comparator?: (a: T, b: T, key: K) => number;
  } = {}
): UseSortReturn<T, K> {
  const {
    initialSortKey = null,
    initialDirection = null,
    comparator = defaultComparator,
  } = options;

  const [sortKey, setSortKey] = useState<K | null>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) {
      return data;
    }

    return [...data].sort((a, b) => {
      const result = comparator(a, b, sortKey);
      return sortDirection === 'asc' ? result : -result;
    });
  }, [data, sortKey, sortDirection, comparator]);

  const sort = useCallback((key: K) => {
    if (sortKey === key) {
      // Cycle through: asc -> desc -> null
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc';
        if (prev === 'desc') return null;
        return 'asc';
      });
      if (sortDirection === 'desc') {
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, sortDirection]);

  const resetSort = useCallback(() => {
    setSortKey(null);
    setSortDirection(null);
  }, []);

  const isSorted = useCallback((key: K) => sortKey === key, [sortKey]);

  const getSortDirection = useCallback(
    (key: K): SortDirection => (sortKey === key ? sortDirection : null),
    [sortKey, sortDirection]
  );

  return {
    sortedData,
    sortKey,
    sortDirection,
    sort,
    resetSort,
    isSorted,
    getSortDirection,
  };
}

/**
 * Hook for multi-column sorting
 */
export function useMultiSort<T, K extends keyof T = keyof T>(
  data: T[]
): {
  sortedData: T[];
  sorts: Array<{ key: K; direction: 'asc' | 'desc' }>;
  addSort: (key: K, direction: 'asc' | 'desc') => void;
  removeSort: (key: K) => void;
  clearSorts: () => void;
} {
  const [sorts, setSorts] = useState<Array<{ key: K; direction: 'asc' | 'desc' }>>([]);

  const sortedData = useMemo(() => {
    if (sorts.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const { key, direction } of sorts) {
        const result = defaultComparator(a, b, key);
        if (result !== 0) {
          return direction === 'asc' ? result : -result;
        }
      }
      return 0;
    });
  }, [data, sorts]);

  const addSort = useCallback((key: K, direction: 'asc' | 'desc') => {
    setSorts(prev => [...prev.filter(s => s.key !== key), { key, direction }]);
  }, []);

  const removeSort = useCallback((key: K) => {
    setSorts(prev => prev.filter(s => s.key !== key));
  }, []);

  const clearSorts = useCallback(() => setSorts([]), []);

  return { sortedData, sorts, addSort, removeSort, clearSorts };
}

export default useSort;

