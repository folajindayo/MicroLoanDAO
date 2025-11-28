import { useState, useMemo, useCallback } from 'react';

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  paginatedData: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  setPageSize: (size: number) => void;
  pageNumbers: number[];
}

/**
 * Hook for paginating data
 */
export function usePagination<T>(
  data: T[],
  options: {
    initialPage?: number;
    initialPageSize?: number;
    maxPageButtons?: number;
  } = {}
): UsePaginationReturn<T> {
  const {
    initialPage = 1,
    initialPageSize = 10,
    maxPageButtons = 5,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => 
    Math.ceil(data.length / pageSize) || 1
  , [data.length, pageSize]);

  // Ensure current page is within bounds
  const validPage = useMemo(() => 
    Math.min(Math.max(1, currentPage), totalPages)
  , [currentPage, totalPages]);

  // Pagination indices
  const startIndex = (validPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, data.length);

  // Get paginated data
  const paginatedData = useMemo(() => 
    data.slice(startIndex, endIndex)
  , [data, startIndex, endIndex]);

  // Navigation states
  const hasNextPage = validPage < totalPages;
  const hasPrevPage = validPage > 1;

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) setCurrentPage(p => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setCurrentPage(p => p - 1);
  }, [hasPrevPage]);

  const firstPage = useCallback(() => setCurrentPage(1), []);
  const lastPage = useCallback(() => setCurrentPage(totalPages), [totalPages]);

  // Generate page number array for pagination UI
  const pageNumbers = useMemo(() => {
    const half = Math.floor(maxPageButtons / 2);
    let start = Math.max(1, validPage - half);
    let end = Math.min(totalPages, start + maxPageButtons - 1);
    
    // Adjust start if we're near the end
    if (end - start + 1 < maxPageButtons) {
      start = Math.max(1, end - maxPageButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [validPage, totalPages, maxPageButtons]);

  return {
    currentPage: validPage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    paginatedData,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    pageNumbers,
  };
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfinitePagination<T>(
  data: T[],
  pageSize: number = 10
): {
  visibleData: T[];
  loadMore: () => void;
  hasMore: boolean;
  reset: () => void;
} {
  const [displayCount, setDisplayCount] = useState(pageSize);

  const visibleData = useMemo(() => 
    data.slice(0, displayCount)
  , [data, displayCount]);

  const hasMore = displayCount < data.length;

  const loadMore = useCallback(() => {
    if (hasMore) {
      setDisplayCount(prev => Math.min(prev + pageSize, data.length));
    }
  }, [hasMore, pageSize, data.length]);

  const reset = useCallback(() => {
    setDisplayCount(pageSize);
  }, [pageSize]);

  return { visibleData, loadMore, hasMore, reset };
}

export default usePagination;

