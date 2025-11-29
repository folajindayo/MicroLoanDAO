/**
 * useLoanStats Hook
 * Aggregated loan statistics
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loan } from '@/types';

export interface LoanStats {
  // Volume stats
  totalVolume: number;
  averageLoanSize: number;
  medianLoanSize: number;
  largestLoan: number;
  smallestLoan: number;

  // Count stats
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  pendingLoans: number;

  // Rate stats
  averageInterestRate: number;
  medianInterestRate: number;
  highestRate: number;
  lowestRate: number;

  // Duration stats
  averageDuration: number;
  shortestDuration: number;
  longestDuration: number;

  // Performance stats
  completionRate: number;
  defaultRate: number;
  activeVolume: number;

  // Time-based stats
  volumeByMonth: Array<{ month: string; volume: number; count: number }>;
  loansPerDay: number;
}

export interface UseLoanStatsState {
  stats: LoanStats | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface UseLoanStatsOptions {
  /** Filter by time period */
  period?: 'all' | '7d' | '30d' | '90d' | '1y';
  /** Auto refresh interval */
  refreshInterval?: number;
  /** Enable auto refresh */
  autoRefresh?: boolean;
}

export interface UseLoanStatsReturn extends UseLoanStatsState {
  refresh: () => Promise<void>;
  calculateStats: (loans: Loan[]) => LoanStats;
  getStatsByPeriod: (period: string) => LoanStats | null;
}

/**
 * Calculate median of number array
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculate statistics from loan array
 */
function calculateLoanStats(loans: Loan[]): LoanStats {
  if (loans.length === 0) {
    return {
      totalVolume: 0,
      averageLoanSize: 0,
      medianLoanSize: 0,
      largestLoan: 0,
      smallestLoan: 0,
      totalLoans: 0,
      activeLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      pendingLoans: 0,
      averageInterestRate: 0,
      medianInterestRate: 0,
      highestRate: 0,
      lowestRate: 0,
      averageDuration: 0,
      shortestDuration: 0,
      longestDuration: 0,
      completionRate: 0,
      defaultRate: 0,
      activeVolume: 0,
      volumeByMonth: [],
      loansPerDay: 0,
    };
  }

  const amounts = loans.map(l => Number(l.amount));
  const rates = loans.map(l => Number(l.interestRate));
  const durations = loans.map(l => Number(l.duration));

  // Count by status
  const statusCounts = loans.reduce((acc, loan) => {
    acc[loan.status] = (acc[loan.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const activeLoans = (statusCounts['ACTIVE'] || 0) + (statusCounts['FUNDED'] || 0);
  const completedLoans = statusCounts['COMPLETED'] || 0;
  const defaultedLoans = statusCounts['DEFAULTED'] || 0;
  const pendingLoans = statusCounts['PENDING'] || 0;

  // Volume calculations
  const totalVolume = amounts.reduce((sum, a) => sum + a, 0);
  const activeVolume = loans
    .filter(l => l.status === 'ACTIVE' || l.status === 'FUNDED')
    .reduce((sum, l) => sum + Number(l.amount), 0);

  // Performance rates
  const finishedLoans = completedLoans + defaultedLoans;
  const completionRate = finishedLoans > 0 ? (completedLoans / finishedLoans) * 100 : 100;
  const defaultRate = finishedLoans > 0 ? (defaultedLoans / finishedLoans) * 100 : 0;

  // Volume by month
  const volumeByMonth: Record<string, { volume: number; count: number }> = {};
  loans.forEach(loan => {
    const date = loan.createdAt ? new Date(loan.createdAt) : new Date();
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!volumeByMonth[monthKey]) {
      volumeByMonth[monthKey] = { volume: 0, count: 0 };
    }
    volumeByMonth[monthKey].volume += Number(loan.amount);
    volumeByMonth[monthKey].count += 1;
  });

  const volumeByMonthArray = Object.entries(volumeByMonth)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calculate loans per day
  const dates = loans.map(l => new Date(l.createdAt || Date.now()).getTime());
  const dayRange = dates.length > 0 
    ? (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24) 
    : 1;
  const loansPerDay = loans.length / Math.max(1, dayRange);

  return {
    totalVolume,
    averageLoanSize: totalVolume / loans.length,
    medianLoanSize: calculateMedian(amounts),
    largestLoan: Math.max(...amounts),
    smallestLoan: Math.min(...amounts),
    totalLoans: loans.length,
    activeLoans,
    completedLoans,
    defaultedLoans,
    pendingLoans,
    averageInterestRate: rates.reduce((sum, r) => sum + r, 0) / rates.length,
    medianInterestRate: calculateMedian(rates),
    highestRate: Math.max(...rates),
    lowestRate: Math.min(...rates),
    averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
    shortestDuration: Math.min(...durations),
    longestDuration: Math.max(...durations),
    completionRate,
    defaultRate,
    activeVolume,
    volumeByMonth: volumeByMonthArray,
    loansPerDay,
  };
}

/**
 * Hook for loan statistics
 */
export function useLoanStats(
  options: UseLoanStatsOptions = {}
): UseLoanStatsReturn {
  const {
    period = 'all',
    refreshInterval = 60000,
    autoRefresh = false,
  } = options;

  const [stats, setStats] = useState<LoanStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cachedStats, setCachedStats] = useState<Record<string, LoanStats>>({});

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ period });
      const response = await fetch(`/api/loans/stats?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch loan stats');
      }

      const data = await response.json();
      
      // If API returns raw loans, calculate stats
      const calculatedStats = data.stats || calculateLoanStats(data.loans || []);
      
      setStats(calculatedStats);
      setCachedStats(prev => ({ ...prev, [period]: calculatedStats }));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  // Get stats by period (from cache)
  const getStatsByPeriod = useCallback((p: string): LoanStats | null => {
    return cachedStats[p] || null;
  }, [cachedStats]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats]);

  return {
    stats,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchStats,
    calculateStats: calculateLoanStats,
    getStatsByPeriod,
  };
}

/**
 * Calculate stats from provided loans (client-side)
 */
export function useCalculatedLoanStats(loans: Loan[]): LoanStats {
  return useMemo(() => calculateLoanStats(loans), [loans]);
}

export default useLoanStats;

