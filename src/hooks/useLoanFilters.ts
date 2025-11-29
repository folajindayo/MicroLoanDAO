/**
 * useLoanFilters Hook
 * Manages loan filtering state and logic
 */

import { useState, useCallback, useMemo } from 'react';
import { Loan } from '@/types';

export interface LoanFilters {
  status: string[];
  minAmount: number | null;
  maxAmount: number | null;
  minRate: number | null;
  maxRate: number | null;
  minDuration: number | null;
  maxDuration: number | null;
  borrower: string | null;
  lender: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface LoanFiltersState {
  filters: LoanFilters;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

export interface UseLoanFiltersReturn extends LoanFiltersState {
  setFilter: <K extends keyof LoanFilters>(key: K, value: LoanFilters[K]) => void;
  setFilters: (filters: Partial<LoanFilters>) => void;
  resetFilters: () => void;
  resetFilter: (key: keyof LoanFilters) => void;
  toggleStatus: (status: string) => void;
  applyFilters: (loans: Loan[]) => Loan[];
  getFilterSummary: () => string;
}

const DEFAULT_FILTERS: LoanFilters = {
  status: [],
  minAmount: null,
  maxAmount: null,
  minRate: null,
  maxRate: null,
  minDuration: null,
  maxDuration: null,
  borrower: null,
  lender: null,
  dateFrom: null,
  dateTo: null,
};

/**
 * Count active filters
 */
function countActiveFilters(filters: LoanFilters): number {
  let count = 0;
  
  if (filters.status.length > 0) count++;
  if (filters.minAmount !== null) count++;
  if (filters.maxAmount !== null) count++;
  if (filters.minRate !== null) count++;
  if (filters.maxRate !== null) count++;
  if (filters.minDuration !== null) count++;
  if (filters.maxDuration !== null) count++;
  if (filters.borrower !== null) count++;
  if (filters.lender !== null) count++;
  if (filters.dateFrom !== null) count++;
  if (filters.dateTo !== null) count++;
  
  return count;
}

/**
 * Hook for managing loan filters
 */
export function useLoanFilters(
  initialFilters: Partial<LoanFilters> = {}
): UseLoanFiltersReturn {
  const [filters, setFiltersState] = useState<LoanFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);
  const hasActiveFilters = activeFilterCount > 0;

  // Set single filter
  const setFilter = useCallback(<K extends keyof LoanFilters>(
    key: K,
    value: LoanFilters[K]
  ) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Set multiple filters
  const setFilters = useCallback((newFilters: Partial<LoanFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  // Reset single filter
  const resetFilter = useCallback((key: keyof LoanFilters) => {
    setFiltersState(prev => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));
  }, []);

  // Toggle status filter
  const toggleStatus = useCallback((status: string) => {
    setFiltersState(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }));
  }, []);

  // Apply filters to loan array
  const applyFilters = useCallback((loans: Loan[]): Loan[] => {
    return loans.filter(loan => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(loan.status)) {
        return false;
      }

      // Amount range filter
      const amount = Number(loan.amount);
      if (filters.minAmount !== null && amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== null && amount > filters.maxAmount) {
        return false;
      }

      // Interest rate range filter
      const rate = Number(loan.interestRate);
      if (filters.minRate !== null && rate < filters.minRate) {
        return false;
      }
      if (filters.maxRate !== null && rate > filters.maxRate) {
        return false;
      }

      // Duration range filter
      const duration = Number(loan.duration);
      if (filters.minDuration !== null && duration < filters.minDuration) {
        return false;
      }
      if (filters.maxDuration !== null && duration > filters.maxDuration) {
        return false;
      }

      // Borrower filter
      if (filters.borrower && loan.borrower?.toLowerCase() !== filters.borrower.toLowerCase()) {
        return false;
      }

      // Lender filter
      if (filters.lender && loan.lender?.toLowerCase() !== filters.lender.toLowerCase()) {
        return false;
      }

      // Date range filter
      const loanDate = loan.createdAt ? new Date(loan.createdAt) : null;
      if (loanDate) {
        if (filters.dateFrom && loanDate < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo && loanDate > filters.dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Get human-readable filter summary
  const getFilterSummary = useCallback((): string => {
    const parts: string[] = [];

    if (filters.status.length > 0) {
      parts.push(`Status: ${filters.status.join(', ')}`);
    }

    if (filters.minAmount !== null || filters.maxAmount !== null) {
      const min = filters.minAmount ?? 0;
      const max = filters.maxAmount ?? '∞';
      parts.push(`Amount: $${min} - $${max}`);
    }

    if (filters.minRate !== null || filters.maxRate !== null) {
      const min = filters.minRate ?? 0;
      const max = filters.maxRate ?? '∞';
      parts.push(`Rate: ${min}% - ${max}%`);
    }

    if (filters.minDuration !== null || filters.maxDuration !== null) {
      const min = filters.minDuration ?? 0;
      const max = filters.maxDuration ?? '∞';
      parts.push(`Duration: ${min} - ${max} days`);
    }

    if (filters.borrower) {
      parts.push(`Borrower: ${filters.borrower.slice(0, 6)}...`);
    }

    if (filters.lender) {
      parts.push(`Lender: ${filters.lender.slice(0, 6)}...`);
    }

    return parts.join(' | ') || 'No filters applied';
  }, [filters]);

  return {
    filters,
    activeFilterCount,
    hasActiveFilters,
    setFilter,
    setFilters,
    resetFilters,
    resetFilter,
    toggleStatus,
    applyFilters,
    getFilterSummary,
  };
}

export default useLoanFilters;

