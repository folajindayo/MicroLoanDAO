/**
 * useLoanHistory Hook
 * Fetches and manages user's loan history
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { Loan } from '@/types';

export interface LoanHistoryItem {
  loan: Loan;
  role: 'borrower' | 'lender';
  events: LoanEvent[];
}

export interface LoanEvent {
  id: string;
  type: 'created' | 'funded' | 'repayment' | 'completed' | 'defaulted' | 'cancelled';
  timestamp: Date;
  txHash?: string;
  amount?: number;
  data?: Record<string, unknown>;
}

export interface LoanHistoryStats {
  totalBorrowed: number;
  totalLent: number;
  totalRepaid: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  averageInterestRate: number;
  onTimePaymentRate: number;
}

export interface LoanHistoryState {
  history: LoanHistoryItem[];
  stats: LoanHistoryStats;
  isLoading: boolean;
  error: Error | null;
}

export interface UseLoanHistoryOptions {
  /** Filter by role */
  role?: 'borrower' | 'lender' | 'all';
  /** Filter by status */
  status?: string[];
  /** Limit results */
  limit?: number;
  /** Include events */
  includeEvents?: boolean;
}

export interface UseLoanHistoryReturn extends LoanHistoryState {
  refresh: () => Promise<void>;
  filterByRole: (role: 'borrower' | 'lender' | 'all') => LoanHistoryItem[];
  filterByStatus: (statuses: string[]) => LoanHistoryItem[];
  getRecentActivity: (count: number) => LoanEvent[];
}

/**
 * Calculate stats from history
 */
function calculateStats(history: LoanHistoryItem[]): LoanHistoryStats {
  const stats: LoanHistoryStats = {
    totalBorrowed: 0,
    totalLent: 0,
    totalRepaid: 0,
    activeLoans: 0,
    completedLoans: 0,
    defaultedLoans: 0,
    averageInterestRate: 0,
    onTimePaymentRate: 100,
  };

  let totalInterestRate = 0;
  let loanCount = 0;

  history.forEach(item => {
    const amount = Number(item.loan.amount);
    const rate = Number(item.loan.interestRate);
    
    if (item.role === 'borrower') {
      stats.totalBorrowed += amount;
    } else {
      stats.totalLent += amount;
    }

    switch (item.loan.status) {
      case 'FUNDED':
      case 'ACTIVE':
        stats.activeLoans++;
        break;
      case 'COMPLETED':
        stats.completedLoans++;
        stats.totalRepaid += amount;
        break;
      case 'DEFAULTED':
        stats.defaultedLoans++;
        break;
    }

    totalInterestRate += rate;
    loanCount++;
  });

  if (loanCount > 0) {
    stats.averageInterestRate = totalInterestRate / loanCount;
    const totalFinished = stats.completedLoans + stats.defaultedLoans;
    stats.onTimePaymentRate = totalFinished > 0 
      ? (stats.completedLoans / totalFinished) * 100 
      : 100;
  }

  return stats;
}

/**
 * Hook for fetching user's loan history
 */
export function useLoanHistory(
  options: UseLoanHistoryOptions = {}
): UseLoanHistoryReturn {
  const {
    role = 'all',
    status,
    limit,
    includeEvents = true,
  } = options;

  const { address } = useAccount();
  const [history, setHistory] = useState<LoanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Calculate stats from history
  const stats = useMemo(() => calculateStats(history), [history]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (!address) {
      setHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('address', address);
      if (role !== 'all') params.append('role', role);
      if (status?.length) params.append('status', status.join(','));
      if (limit) params.append('limit', String(limit));
      if (includeEvents) params.append('includeEvents', 'true');

      const response = await fetch(`/api/history?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch history: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform data to history items
      const historyItems: LoanHistoryItem[] = data.map((item: any) => ({
        loan: item.loan || item,
        role: item.loan?.borrower?.toLowerCase() === address.toLowerCase() 
          ? 'borrower' 
          : 'lender',
        events: item.events || [],
      }));

      setHistory(historyItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [address, role, status, limit, includeEvents]);

  // Filter by role
  const filterByRole = useCallback((filterRole: 'borrower' | 'lender' | 'all'): LoanHistoryItem[] => {
    if (filterRole === 'all') return history;
    return history.filter(item => item.role === filterRole);
  }, [history]);

  // Filter by status
  const filterByStatus = useCallback((statuses: string[]): LoanHistoryItem[] => {
    if (!statuses.length) return history;
    return history.filter(item => statuses.includes(item.loan.status));
  }, [history]);

  // Get recent activity
  const getRecentActivity = useCallback((count: number): LoanEvent[] => {
    const allEvents = history.flatMap(item => 
      item.events.map(event => ({
        ...event,
        loanId: item.loan.id,
      }))
    );

    return allEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }, [history]);

  // Initial fetch
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    stats,
    isLoading,
    error,
    refresh: fetchHistory,
    filterByRole,
    filterByStatus,
    getRecentActivity,
  };
}

export default useLoanHistory;

