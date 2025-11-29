/**
 * useLoanSearch Hook
 * Search functionality for loans
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Loan } from '@/types';

export interface SearchOptions {
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Minimum characters before search */
  minChars?: number;
  /** Fields to search in */
  searchFields?: Array<keyof Loan | string>;
  /** Case sensitive search */
  caseSensitive?: boolean;
  /** Fuzzy matching threshold (0-1) */
  fuzzyThreshold?: number;
}

export interface SearchState {
  query: string;
  isSearching: boolean;
  results: Loan[];
  resultCount: number;
  hasSearched: boolean;
}

export interface UseLoanSearchReturn extends SearchState {
  setQuery: (query: string) => void;
  search: (loans: Loan[]) => Loan[];
  clearSearch: () => void;
  highlightMatch: (text: string) => string;
}

const DEFAULT_SEARCH_FIELDS: Array<keyof Loan | string> = [
  'id',
  'borrower',
  'lender',
  'purpose',
  'status',
];

/**
 * Simple fuzzy matching
 */
function fuzzyMatch(text: string, query: string, threshold: number): boolean {
  if (!text || !query) return false;
  
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Exact match
  if (textLower.includes(queryLower)) return true;
  
  // Fuzzy match - calculate similarity
  let matches = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      matches++;
      queryIndex++;
    }
  }
  
  const similarity = matches / queryLower.length;
  return similarity >= threshold;
}

/**
 * Get nested value from object
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * Hook for searching loans
 */
export function useLoanSearch(
  options: SearchOptions = {}
): UseLoanSearchReturn {
  const {
    debounceMs = 300,
    minChars = 2,
    searchFields = DEFAULT_SEARCH_FIELDS,
    caseSensitive = false,
    fuzzyThreshold = 0.6,
  } = options;

  const [query, setQueryState] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Loan[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced query update
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setIsSearching(true);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(newQuery);
      setIsSearching(false);
    }, debounceMs);
  }, [debounceMs]);

  // Clear search
  const clearSearch = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
    setResults([]);
    setHasSearched(false);
    setIsSearching(false);
  }, []);

  // Search function
  const search = useCallback((loans: Loan[]): Loan[] => {
    if (!debouncedQuery || debouncedQuery.length < minChars) {
      return loans;
    }

    const normalizedQuery = caseSensitive ? debouncedQuery : debouncedQuery.toLowerCase();

    const filtered = loans.filter(loan => {
      return searchFields.some(field => {
        const value = getNestedValue(loan as Record<string, any>, field as string);
        if (value === null || value === undefined) return false;

        const stringValue = String(value);
        const normalizedValue = caseSensitive ? stringValue : stringValue.toLowerCase();

        // Check for exact/substring match first
        if (normalizedValue.includes(normalizedQuery)) {
          return true;
        }

        // Fall back to fuzzy match
        return fuzzyMatch(normalizedValue, normalizedQuery, fuzzyThreshold);
      });
    });

    setResults(filtered);
    setHasSearched(true);
    
    return filtered;
  }, [debouncedQuery, minChars, searchFields, caseSensitive, fuzzyThreshold]);

  // Highlight matching text
  const highlightMatch = useCallback((text: string): string => {
    if (!debouncedQuery || debouncedQuery.length < minChars) {
      return text;
    }

    const regex = new RegExp(
      `(${debouncedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      caseSensitive ? 'g' : 'gi'
    );

    return text.replace(regex, '<mark>$1</mark>');
  }, [debouncedQuery, minChars, caseSensitive]);

  // Result count
  const resultCount = useMemo(() => results.length, [results]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    query,
    isSearching,
    results,
    resultCount,
    hasSearched,
    setQuery,
    search,
    clearSearch,
    highlightMatch,
  };
}

/**
 * Combined search and filter hook
 */
export function useLoanSearchWithFilter(
  loans: Loan[],
  options: SearchOptions = {}
): {
  filteredLoans: Loan[];
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
  resultCount: number;
  clearSearch: () => void;
} {
  const { query, setQuery, search, isSearching, clearSearch } = useLoanSearch(options);

  const filteredLoans = useMemo(
    () => search(loans),
    [search, loans]
  );

  return {
    filteredLoans,
    query,
    setQuery,
    isSearching,
    resultCount: filteredLoans.length,
    clearSearch,
  };
}

export default useLoanSearch;

