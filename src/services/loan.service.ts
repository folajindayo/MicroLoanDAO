/**
 * Loan Service
 * 
 * Business logic for loan operations including calculations,
 * validation, data transformation, and caching.
 */

import { type Address } from 'viem';
import { LoanStatus } from '@/constants/contracts';

export interface LoanData {
  id: bigint;
  borrower: Address;
  lender: Address;
  amount: bigint;
  interestRate: bigint;
  purpose: string;
  duration: bigint;
  requestedAt: bigint;
  fundedAt: bigint;
  repaidAt: bigint;
  status: LoanStatus;
}

export interface LoanCalculation {
  principal: bigint;
  interest: bigint;
  lateFee: bigint;
  totalRepayment: bigint;
  isLate: boolean;
  daysOverdue: number;
}

export interface LoanSummary {
  totalLoans: number;
  totalRequested: number;
  totalFunded: number;
  totalRepaid: number;
  totalDefaulted: number;
  totalVolume: bigint;
}

export interface LoanFilter {
  status?: LoanStatus | 'all';
  borrower?: Address;
  lender?: Address;
  minAmount?: bigint;
  maxAmount?: bigint;
  minInterestRate?: bigint;
  maxInterestRate?: bigint;
}

// Cache configuration
interface CacheEntry<T> {
  data: T;
  expiry: number;
  stale: number;
}

interface CacheConfig {
  ttl: number;
  staleTime: number;
  maxSize: number;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  ttl: 60000, // 1 minute
  staleTime: 30000, // 30 seconds (stale-while-revalidate)
  maxSize: 1000,
};

// In-memory caches
const loanCache: Map<string, CacheEntry<LoanData>> = new Map();
const listCache: Map<string, CacheEntry<LoanData[]>> = new Map();
const calculationCache: Map<string, CacheEntry<LoanCalculation>> = new Map();
const summaryCache: Map<string, CacheEntry<LoanSummary>> = new Map();

// Cache statistics
let cacheHits = 0;
let cacheMisses = 0;

class LoanService {
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
  }

  /**
   * Generate cache key
   */
  private getCacheKey(prefix: string, params: Record<string, unknown>): string {
    return `${prefix}_${JSON.stringify(params)}`;
  }

  /**
   * Get from cache with stale-while-revalidate support
   */
  private getFromCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string
  ): { data: T | null; isStale: boolean } {
    const entry = cache.get(key);
    if (!entry) {
      cacheMisses++;
      return { data: null, isStale: false };
    }

    const now = Date.now();
    if (now > entry.expiry) {
      cache.delete(key);
      cacheMisses++;
      return { data: null, isStale: false };
    }

    cacheHits++;
    return {
      data: entry.data,
      isStale: now > entry.stale,
    };
  }

  /**
   * Set cache entry
   */
  private setCache<T>(
    cache: Map<string, CacheEntry<T>>,
    key: string,
    data: T
  ): void {
    // Enforce max size
    if (cache.size >= this.config.maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey) cache.delete(firstKey);
    }

    const now = Date.now();
    cache.set(key, {
      data,
      expiry: now + this.config.ttl,
      stale: now + this.config.staleTime,
    });
  }

  /**
   * Invalidate cache entries
   */
  invalidateCache(pattern?: string): void {
    const caches = [loanCache, listCache, calculationCache, summaryCache];
    
    for (const cache of caches) {
      if (pattern) {
        for (const key of cache.keys()) {
          if (key.includes(pattern)) {
            cache.delete(key);
          }
        }
      } else {
        cache.clear();
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { hits: number; misses: number; hitRate: number } {
    const total = cacheHits + cacheMisses;
    return {
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
    };
  }

  /**
   * Fetch loan by ID with caching
   */
  async getLoan(loanId: string): Promise<LoanData | null> {
    const cacheKey = this.getCacheKey('loan', { id: loanId });
    const { data: cached, isStale } = this.getFromCache(loanCache, cacheKey);

    if (cached && !isStale) {
      return cached;
    }

    // Fetch fresh data
    try {
      const response = await fetch(`/api/loans/${loanId}`);
      if (!response.ok) return null;
      
      const loan = await response.json() as LoanData;
      this.setCache(loanCache, cacheKey, loan);

      return loan;
    } catch (error) {
      console.error('Failed to fetch loan:', error);
      return cached || null; // Return stale data if available
    }
  }

  /**
   * Fetch loans list with caching
   */
  async getLoans(filter?: LoanFilter): Promise<LoanData[]> {
    const cacheKey = this.getCacheKey('loans', filter || {});
    const { data: cached, isStale } = this.getFromCache(listCache, cacheKey);

    if (cached && !isStale) {
      return cached;
    }

    try {
      const params = new URLSearchParams();
      if (filter?.status && filter.status !== 'all') {
        params.set('status', String(filter.status));
      }
      if (filter?.borrower) params.set('borrower', filter.borrower);
      if (filter?.lender) params.set('lender', filter.lender);

      const response = await fetch(`/api/loans?${params.toString()}`);
      if (!response.ok) return cached || [];

      const loans = await response.json() as LoanData[];
      this.setCache(listCache, cacheKey, loans);

      return loans;
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      return cached || [];
    }
  }

  /**
   * Calculate loan repayment with caching
   */
  calculateRepayment(loan: LoanData, currentTimestamp?: bigint): LoanCalculation {
    const now = currentTimestamp ?? BigInt(Math.floor(Date.now() / 1000));
    const cacheKey = this.getCacheKey('calc', { id: String(loan.id), ts: String(now) });
    
    const { data: cached } = this.getFromCache(calculationCache, cacheKey);
    if (cached) return cached;

    const principal = loan.amount;
    const interest = (principal * loan.interestRate) / 10000n;
    
    let lateFee = 0n;
    let isLate = false;
    let daysOverdue = 0;
    
    if (loan.status === LoanStatus.FUNDED && loan.fundedAt > 0n) {
      const dueDate = loan.fundedAt + loan.duration;
      if (now > dueDate) {
        isLate = true;
        daysOverdue = Number((now - dueDate) / 86400n);
        lateFee = (principal * 500n) / 10000n; // 5% late fee
      }
    }
    
    const result: LoanCalculation = {
      principal,
      interest,
      lateFee,
      totalRepayment: principal + interest + lateFee,
      isLate,
      daysOverdue,
    };

    this.setCache(calculationCache, cacheKey, result);
    return result;
  }

  /**
   * Calculate loan summary with caching
   */
  calculateSummary(loans: LoanData[]): LoanSummary {
    const cacheKey = this.getCacheKey('summary', { count: loans.length });
    const { data: cached } = this.getFromCache(summaryCache, cacheKey);
    if (cached) return cached;

    const summary = loans.reduce(
      (acc, loan) => {
        acc.totalLoans++;
        acc.totalVolume += loan.amount;
        
        switch (loan.status) {
          case LoanStatus.REQUESTED:
            acc.totalRequested++;
            break;
          case LoanStatus.FUNDED:
            acc.totalFunded++;
            break;
          case LoanStatus.REPAID:
            acc.totalRepaid++;
            break;
          case LoanStatus.DEFAULTED:
            acc.totalDefaulted++;
            break;
        }
        
        return acc;
      },
      {
        totalLoans: 0,
        totalRequested: 0,
        totalFunded: 0,
        totalRepaid: 0,
        totalDefaulted: 0,
        totalVolume: 0n,
      } as LoanSummary
    );

    this.setCache(summaryCache, cacheKey, summary);
    return summary;
  }
}

// Create singleton instance
export const loanService = new LoanService();

// Export standalone functions for backward compatibility

/**
 * Calculate loan repayment amount
 */
export function calculateRepayment(loan: LoanData, currentTimestamp?: bigint): LoanCalculation {
  return loanService.calculateRepayment(loan, currentTimestamp);
}

/**
 * Calculate APR from interest rate (basis points) and duration
 */
export function calculateAPR(interestRate: bigint, durationSeconds: bigint): number {
  const ratePercent = Number(interestRate) / 100;
  const durationDays = Number(durationSeconds) / 86400;
  const annualizedRate = (ratePercent / durationDays) * 365;
  return Math.round(annualizedRate * 100) / 100;
}

/**
 * Get loan due date
 */
export function getLoanDueDate(loan: LoanData): Date | null {
  if (loan.fundedAt === 0n) return null;
  const dueDateSeconds = Number(loan.fundedAt + loan.duration);
  return new Date(dueDateSeconds * 1000);
}

/**
 * Get loan time remaining
 */
export function getLoanTimeRemaining(loan: LoanData): number {
  if (loan.fundedAt === 0n) return 0;
  const dueDate = Number(loan.fundedAt + loan.duration);
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, dueDate - now);
}

/**
 * Format loan duration for display
 */
export function formatLoanDuration(seconds: bigint): string {
  const totalSeconds = Number(seconds);
  
  if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (totalSeconds < 86400) {
    const hours = Math.floor(totalSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(totalSeconds / 86400);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Check if user can fund a loan
 */
export function canFundLoan(loan: LoanData, userAddress: Address): { canFund: boolean; reason?: string } {
  if (loan.status !== LoanStatus.REQUESTED) {
    return { canFund: false, reason: 'Loan is not available for funding' };
  }
  
  if (loan.borrower.toLowerCase() === userAddress.toLowerCase()) {
    return { canFund: false, reason: 'Cannot fund your own loan' };
  }
  
  return { canFund: true };
}

/**
 * Check if user can repay a loan
 */
export function canRepayLoan(loan: LoanData, userAddress: Address): { canRepay: boolean; reason?: string } {
  if (loan.status !== LoanStatus.FUNDED) {
    return { canRepay: false, reason: 'Loan is not active' };
  }
  
  return { canRepay: true };
}

/**
 * Calculate loan health score (0-100)
 */
export function calculateLoanHealth(loan: LoanData): number {
  if (loan.status === LoanStatus.REPAID) return 100;
  if (loan.status === LoanStatus.DEFAULTED) return 0;
  if (loan.status === LoanStatus.REQUESTED) return 50;
  
  const timeRemaining = getLoanTimeRemaining(loan);
  const totalDuration = Number(loan.duration);
  
  if (timeRemaining <= 0) {
    const daysOverdue = Math.abs(timeRemaining) / 86400;
    return Math.max(0, 50 - daysOverdue * 5);
  }
  
  const percentRemaining = (timeRemaining / totalDuration) * 100;
  return Math.min(100, 50 + percentRemaining / 2);
}

/**
 * Get loan status color class
 */
export function getLoanStatusColor(status: LoanStatus): string {
  const colors: Record<LoanStatus, string> = {
    [LoanStatus.REQUESTED]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    [LoanStatus.FUNDED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    [LoanStatus.REPAID]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    [LoanStatus.DEFAULTED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return colors[status];
}

/**
 * Get loan status label
 */
export function getLoanStatusLabel(status: LoanStatus): string {
  const labels: Record<LoanStatus, string> = {
    [LoanStatus.REQUESTED]: 'Requested',
    [LoanStatus.FUNDED]: 'Active',
    [LoanStatus.REPAID]: 'Repaid',
    [LoanStatus.DEFAULTED]: 'Defaulted',
  };
  return labels[status];
}

/**
 * Calculate loan summary from array of loans
 */
export function calculateLoanSummary(loans: LoanData[]): LoanSummary {
  return loanService.calculateSummary(loans);
}

/**
 * Sort loans by various criteria
 */
export type LoanSortCriteria = 'newest' | 'oldest' | 'amount_high' | 'amount_low' | 'interest_high' | 'interest_low';

export function sortLoans(loans: LoanData[], criteria: LoanSortCriteria): LoanData[] {
  const sorted = [...loans];
  
  switch (criteria) {
    case 'newest':
      return sorted.sort((a, b) => Number(b.requestedAt - a.requestedAt));
    case 'oldest':
      return sorted.sort((a, b) => Number(a.requestedAt - b.requestedAt));
    case 'amount_high':
      return sorted.sort((a, b) => Number(b.amount - a.amount));
    case 'amount_low':
      return sorted.sort((a, b) => Number(a.amount - b.amount));
    case 'interest_high':
      return sorted.sort((a, b) => Number(b.interestRate - a.interestRate));
    case 'interest_low':
      return sorted.sort((a, b) => Number(a.interestRate - b.interestRate));
    default:
      return sorted;
  }
}

/**
 * Filter loans by status
 */
export function filterLoansByStatus(loans: LoanData[], status: LoanStatus | 'all'): LoanData[] {
  if (status === 'all') return loans;
  return loans.filter(loan => loan.status === status);
}

/**
 * Filter loans by multiple criteria
 */
export function filterLoans(loans: LoanData[], filter: LoanFilter): LoanData[] {
  let filtered = [...loans];

  if (filter.status && filter.status !== 'all') {
    filtered = filtered.filter(l => l.status === filter.status);
  }

  if (filter.borrower) {
    filtered = filtered.filter(l => l.borrower.toLowerCase() === filter.borrower!.toLowerCase());
  }

  if (filter.lender) {
    filtered = filtered.filter(l => l.lender.toLowerCase() === filter.lender!.toLowerCase());
  }

  if (filter.minAmount !== undefined) {
    filtered = filtered.filter(l => l.amount >= filter.minAmount!);
  }

  if (filter.maxAmount !== undefined) {
    filtered = filtered.filter(l => l.amount <= filter.maxAmount!);
  }

  if (filter.minInterestRate !== undefined) {
    filtered = filtered.filter(l => l.interestRate >= filter.minInterestRate!);
  }

  if (filter.maxInterestRate !== undefined) {
    filtered = filtered.filter(l => l.interestRate <= filter.maxInterestRate!);
  }

  return filtered;
}

export { LoanService };
export default loanService;
