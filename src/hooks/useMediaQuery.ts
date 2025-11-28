import { useState, useEffect } from 'react';

export const breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
  dark: '(prefers-color-scheme: dark)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
} as const;

/**
 * Hook for matching media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, [query]);

  return matches;
}

/**
 * Hook for checking common breakpoints
 */
export function useBreakpoint() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2Xl = useMediaQuery(breakpoints['2xl']);

  return {
    isMobile: !isSm,
    isTablet: isSm && !isLg,
    isDesktop: isLg,
    isSm, isMd, isLg, isXl, is2Xl,
  };
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery(breakpoints.dark);
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery(breakpoints.reducedMotion);
}

export default useMediaQuery;

