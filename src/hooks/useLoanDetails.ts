/**
 * useLoanDetails Hook
 * Fetches and manages detailed loan data
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loan } from '@/types';

export interface LoanDetailsState {
  loan: Loan | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface LoanDetailsActions {
  refresh: () => Promise<void>;
  updateLoan: (updates: Partial<Loan>) => void;
}

export interface UseLoanDetailsReturn extends LoanDetailsState, LoanDetailsActions {}

export interface UseLoanDetailsOptions {
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
  /** Enable/disable auto-refresh */
  autoRefresh?: boolean;
  /** Fetch on mount */
  fetchOnMount?: boolean;
}

/**
 * Hook for fetching and managing loan details
 */
export function useLoanDetails(
  loanId: string | undefined,
  options: UseLoanDetailsOptions = {}
): UseLoanDetailsReturn {
  const {
    refreshInterval = 30000,
    autoRefresh = false,
    fetchOnMount = true,
  } = options;

  const [loan, setLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch loan details
  const fetchLoanDetails = useCallback(async () => {
    if (!loanId) {
      setLoan(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/loans/${loanId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch loan: ${response.statusText}`);
      }

      const data = await response.json();
      setLoan(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoan(null);
    } finally {
      setIsLoading(false);
    }
  }, [loanId]);

  // Refresh action
  const refresh = useCallback(async () => {
    await fetchLoanDetails();
  }, [fetchLoanDetails]);

  // Local update (optimistic)
  const updateLoan = useCallback((updates: Partial<Loan>) => {
    setLoan(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (fetchOnMount && loanId) {
      fetchLoanDetails();
    }
  }, [fetchOnMount, loanId, fetchLoanDetails]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !loanId) return;

    const interval = setInterval(fetchLoanDetails, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, loanId, refreshInterval, fetchLoanDetails]);

  return {
    loan,
    isLoading,
    error,
    lastUpdated,
    refresh,
    updateLoan,
  };
}

/**
 * Calculate derived loan information
 */
export function useLoanDerivedData(loan: Loan | null) {
  return useMemo(() => {
    if (!loan) return null;

    const principal = Number(loan.amount);
    const rate = Number(loan.interestRate) / 100;
    const durationDays = Number(loan.duration);

    // Simple interest calculation
    const totalInterest = principal * rate * (durationDays / 365);
    const totalRepayment = principal + totalInterest;
    
    // Time calculations
    const startDate = loan.createdAt ? new Date(loan.createdAt) : new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)));
    const daysElapsed = durationDays - daysRemaining;
    const progressPercent = durationDays > 0 ? (daysElapsed / durationDays) * 100 : 0;

    // Status flags
    const isOverdue = now > endDate && loan.status !== 'COMPLETED';
    const isActive = loan.status === 'FUNDED' || loan.status === 'ACTIVE';

    return {
      principal,
      totalInterest,
      totalRepayment,
      startDate,
      endDate,
      daysRemaining,
      daysElapsed,
      progressPercent,
      isOverdue,
      isActive,
      dailyInterest: totalInterest / durationDays,
    };
  }, [loan]);
}

export default useLoanDetails;

