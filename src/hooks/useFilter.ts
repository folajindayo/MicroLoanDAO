import { useState, useMemo, useCallback } from 'react';

type FilterValue = string | number | boolean | null;
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

interface Filter<K> {
  key: K;
  value: FilterValue;
  operator?: FilterOperator;
}

interface UseFilterReturn<T, K extends keyof T> {
  filteredData: T[];
  filters: Filter<K>[];
  addFilter: (key: K, value: FilterValue, operator?: FilterOperator) => void;
  removeFilter: (key: K) => void;
  updateFilter: (key: K, value: FilterValue, operator?: FilterOperator) => void;
  clearFilters: () => void;
  hasFilter: (key: K) => boolean;
  getFilterValue: (key: K) => FilterValue | undefined;
}

/**
 * Apply a single filter to a value
 */
function applyFilter(value: unknown, filterValue: FilterValue, operator: FilterOperator): boolean {
  if (filterValue === null || filterValue === undefined) return true;
  if (value === null || value === undefined) return false;

  const strValue = String(value).toLowerCase();
  const strFilter = String(filterValue).toLowerCase();

  switch (operator) {
    case 'eq':
      return value === filterValue || strValue === strFilter;
    case 'neq':
      return value !== filterValue && strValue !== strFilter;
    case 'gt':
      return typeof value === 'number' && typeof filterValue === 'number' && value > filterValue;
    case 'gte':
      return typeof value === 'number' && typeof filterValue === 'number' && value >= filterValue;
    case 'lt':
      return typeof value === 'number' && typeof filterValue === 'number' && value < filterValue;
    case 'lte':
      return typeof value === 'number' && typeof filterValue === 'number' && value <= filterValue;
    case 'contains':
      return strValue.includes(strFilter);
    case 'startsWith':
      return strValue.startsWith(strFilter);
    case 'endsWith':
      return strValue.endsWith(strFilter);
    default:
      return strValue.includes(strFilter);
  }
}

/**
 * Hook for filtering data
 */
export function useFilter<T, K extends keyof T = keyof T>(
  data: T[],
  initialFilters: Filter<K>[] = []
): UseFilterReturn<T, K> {
  const [filters, setFilters] = useState<Filter<K>[]>(initialFilters);

  const filteredData = useMemo(() => {
    if (filters.length === 0) return data;

    return data.filter(item => {
      return filters.every(filter => {
        const value = item[filter.key];
        return applyFilter(value, filter.value, filter.operator || 'contains');
      });
    });
  }, [data, filters]);

  const addFilter = useCallback((key: K, value: FilterValue, operator: FilterOperator = 'contains') => {
    setFilters(prev => [...prev.filter(f => f.key !== key), { key, value, operator }]);
  }, []);

  const removeFilter = useCallback((key: K) => {
    setFilters(prev => prev.filter(f => f.key !== key));
  }, []);

  const updateFilter = useCallback((key: K, value: FilterValue, operator?: FilterOperator) => {
    setFilters(prev => prev.map(f => 
      f.key === key ? { ...f, value, operator: operator || f.operator } : f
    ));
  }, []);

  const clearFilters = useCallback(() => setFilters([]), []);

  const hasFilter = useCallback((key: K) => filters.some(f => f.key === key), [filters]);

  const getFilterValue = useCallback((key: K): FilterValue | undefined => {
    const filter = filters.find(f => f.key === key);
    return filter?.value;
  }, [filters]);

  return {
    filteredData,
    filters,
    addFilter,
    removeFilter,
    updateFilter,
    clearFilters,
    hasFilter,
    getFilterValue,
  };
}

/**
 * Hook for simple text search filtering
 */
export function useSearch<T>(
  data: T[],
  searchKeys: (keyof T)[],
  initialQuery: string = ''
): {
  searchedData: T[];
  query: string;
  setQuery: (query: string) => void;
  clearSearch: () => void;
} {
  const [query, setQuery] = useState(initialQuery);

  const searchedData = useMemo(() => {
    if (!query.trim()) return data;
    
    const lowerQuery = query.toLowerCase();
    return data.filter(item => 
      searchKeys.some(key => {
        const value = item[key];
        return value !== null && 
               value !== undefined && 
               String(value).toLowerCase().includes(lowerQuery);
      })
    );
  }, [data, query, searchKeys]);

  const clearSearch = useCallback(() => setQuery(''), []);

  return { searchedData, query, setQuery, clearSearch };
}

export default useFilter;

