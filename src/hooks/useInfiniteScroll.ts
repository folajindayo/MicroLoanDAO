'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  sentinelRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  hasMore: boolean;
  setHasMore: (value: boolean) => void;
  reset: () => void;
}

/**
 * Hook for implementing infinite scroll
 */
export function useInfiniteScroll(
  loadMore: () => Promise<void>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore || !enabled) return;

    setIsLoading(true);
    try {
      await loadMore();
    } finally {
      setIsLoading(false);
    }
  }, [loadMore, isLoading, hasMore, enabled]);

  useEffect(() => {
    if (!enabled || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, isLoading, handleLoadMore, threshold, rootMargin]);

  const reset = useCallback(() => {
    setHasMore(true);
    setIsLoading(false);
  }, []);

  return {
    sentinelRef,
    isLoading,
    hasMore,
    setHasMore,
    reset,
  };
}

/**
 * Hook for scroll-based lazy loading with page numbers
 */
export function useInfiniteScrollPaginated<T>(
  fetchPage: (page: number) => Promise<T[]>,
  options: UseInfiniteScrollOptions & { pageSize?: number } = {}
): {
  data: T[];
  sentinelRef: React.RefObject<HTMLDivElement>;
  isLoading: boolean;
  hasMore: boolean;
  error: Error | null;
  reset: () => void;
  page: number;
} {
  const { pageSize = 10, ...scrollOptions } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newItems = await fetchPage(page);
      setData(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      
      if (newItems.length < pageSize) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load'));
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, page, pageSize, isLoading, hasMore]);

  const infiniteScroll = useInfiniteScroll(loadMore, {
    ...scrollOptions,
    enabled: hasMore && !isLoading,
  });

  const reset = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    infiniteScroll.reset();
  }, [infiniteScroll]);

  return {
    data,
    sentinelRef,
    isLoading,
    hasMore,
    error,
    reset,
    page,
  };
}

export default useInfiniteScroll;

