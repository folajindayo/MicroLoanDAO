/**
 * useLoanFilters Hook
 * Manage loan list filtering
 */

import { useState, useCallback, useMemo } from 'react';

export type LoanStatus = 
  | 'all'
  | 'pending'
  | 'active'
  | 'funded'
  | 'repaying'
  | 'completed'
  | 'defaulted'
  | 'liquidated';

export type SortField = 
  | 'createdAt'
  | 'amount'
  | 'interestRate'
  | 'duration'
  | 'collateralRatio'
  | 'healthFactor';

export type SortOrder = 'asc' | 'desc';

export interface LoanFilters {
  status: LoanStatus;
  minAmount?: number;
  maxAmount?: number;
  minInterestRate?: number;
  maxInterestRate?: number;
  minDuration?: number;
  maxDuration?: number;
  minCollateralRatio?: number;
  maxCollateralRatio?: number;
  collateralType?: string;
  borrower?: string;
  lender?: string;
  search?: string;
}

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface UseLoanFiltersReturn {
  filters: LoanFilters;
  sort: SortConfig;
  setFilter: <K extends keyof LoanFilters>(key: K, value: LoanFilters[K]) => void;
  setFilters: (filters: Partial<LoanFilters>) => void;
  setSort: (field: SortField, order?: SortOrder) => void;
  toggleSortOrder: () => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  getFilterString: () => string;
  applyFilters: <T extends Record<string, unknown>>(items: T[]) => T[];
}

const DEFAULT_FILTERS: LoanFilters = {
  status: 'all',
};

const DEFAULT_SORT: SortConfig = {
  field: 'createdAt',
  order: 'desc',
};

export function useLoanFilters(
  initialFilters: Partial<LoanFilters> = {},
  initialSort: Partial<SortConfig> = {}
): UseLoanFiltersReturn {
  const [filters, setFiltersState] = useState<LoanFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [sort, setSort] = useState<SortConfig>({
    ...DEFAULT_SORT,
    ...initialSort,
  });

  const setFilter = useCallback(<K extends keyof LoanFilters>(
    key: K,
    value: LoanFilters[K]
  ) => {
    setFiltersState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<LoanFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleSetSort = useCallback((field: SortField, order?: SortOrder) => {
    setSort(prev => ({
      field,
      order: order ?? (prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'),
    }));
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSort(prev => ({
      ...prev,
      order: prev.order === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
  }, []);

  const hasActiveFilters = useMemo(() => {
    const { status, ...otherFilters } = filters;
    
    if (status !== 'all') return true;
    
    return Object.values(otherFilters).some(value => 
      value !== undefined && value !== '' && value !== null
    );
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    
    if (filters.status !== 'all') count++;
    if (filters.minAmount !== undefined) count++;
    if (filters.maxAmount !== undefined) count++;
    if (filters.minInterestRate !== undefined) count++;
    if (filters.maxInterestRate !== undefined) count++;
    if (filters.minDuration !== undefined) count++;
    if (filters.maxDuration !== undefined) count++;
    if (filters.minCollateralRatio !== undefined) count++;
    if (filters.maxCollateralRatio !== undefined) count++;
    if (filters.collateralType) count++;
    if (filters.borrower) count++;
    if (filters.lender) count++;
    if (filters.search) count++;

    return count;
  }, [filters]);

  const getFilterString = useCallback((): string => {
    const parts: string[] = [];

    if (filters.status !== 'all') {
      parts.push(`status:${filters.status}`);
    }
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      parts.push(`amount:${filters.minAmount ?? '0'}-${filters.maxAmount ?? '∞'}`);
    }
    if (filters.minInterestRate !== undefined || filters.maxInterestRate !== undefined) {
      parts.push(`rate:${filters.minInterestRate ?? '0'}-${filters.maxInterestRate ?? '∞'}%`);
    }
    if (filters.search) {
      parts.push(`search:"${filters.search}"`);
    }

    return parts.join(' ');
  }, [filters]);

  const applyFilters = useCallback(<T extends Record<string, unknown>>(items: T[]): T[] => {
    let filtered = [...items];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    // Amount filters
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(item => {
        const amount = Number(item.amount ?? item.principalAmount ?? 0);
        return amount >= filters.minAmount!;
      });
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(item => {
        const amount = Number(item.amount ?? item.principalAmount ?? 0);
        return amount <= filters.maxAmount!;
      });
    }

    // Interest rate filters
    if (filters.minInterestRate !== undefined) {
      filtered = filtered.filter(item => {
        const rate = Number(item.interestRate ?? 0);
        return rate >= filters.minInterestRate!;
      });
    }
    if (filters.maxInterestRate !== undefined) {
      filtered = filtered.filter(item => {
        const rate = Number(item.interestRate ?? 0);
        return rate <= filters.maxInterestRate!;
      });
    }

    // Duration filters
    if (filters.minDuration !== undefined) {
      filtered = filtered.filter(item => {
        const duration = Number(item.duration ?? 0);
        return duration >= filters.minDuration!;
      });
    }
    if (filters.maxDuration !== undefined) {
      filtered = filtered.filter(item => {
        const duration = Number(item.duration ?? 0);
        return duration <= filters.maxDuration!;
      });
    }

    // Collateral ratio filters
    if (filters.minCollateralRatio !== undefined) {
      filtered = filtered.filter(item => {
        const ratio = Number(item.collateralRatio ?? 0);
        return ratio >= filters.minCollateralRatio!;
      });
    }
    if (filters.maxCollateralRatio !== undefined) {
      filtered = filtered.filter(item => {
        const ratio = Number(item.collateralRatio ?? 0);
        return ratio <= filters.maxCollateralRatio!;
      });
    }

    // Collateral type filter
    if (filters.collateralType) {
      filtered = filtered.filter(item => 
        item.collateralType === filters.collateralType
      );
    }

    // Address filters
    if (filters.borrower) {
      const borrowerLower = filters.borrower.toLowerCase();
      filtered = filtered.filter(item => 
        String(item.borrower ?? '').toLowerCase() === borrowerLower
      );
    }
    if (filters.lender) {
      const lenderLower = filters.lender.toLowerCase();
      filtered = filtered.filter(item => 
        String(item.lender ?? '').toLowerCase() === lenderLower
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => {
        const searchableFields = [
          item.id,
          item.borrower,
          item.lender,
          item.collateralType,
        ].filter(Boolean);
        
        return searchableFields.some(field => 
          String(field).toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];

      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.order === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [filters, sort]);

  return {
    filters,
    sort,
    setFilter,
    setFilters,
    setSort: handleSetSort,
    toggleSortOrder,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
    getFilterString,
    applyFilters,
  };
}

export default useLoanFilters;
