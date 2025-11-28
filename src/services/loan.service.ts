/**
 * Loan Service
 * 
 * Business logic for loan operations including calculations,
 * validation, and data transformation.
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

/**
 * Calculate loan repayment amount
 */
export function calculateRepayment(loan: LoanData, currentTimestamp?: bigint): LoanCalculation {
  const now = currentTimestamp ?? BigInt(Math.floor(Date.now() / 1000));
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
  
  return {
    principal,
    interest,
    lateFee,
    totalRepayment: principal + interest + lateFee,
    isLate,
    daysOverdue,
  };
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
  
  // Anyone can repay (as per contract design)
  return { canRepay: true };
}

/**
 * Calculate loan health score (0-100)
 */
export function calculateLoanHealth(loan: LoanData): number {
  if (loan.status === LoanStatus.REPAID) return 100;
  if (loan.status === LoanStatus.DEFAULTED) return 0;
  if (loan.status === LoanStatus.REQUESTED) return 50;
  
  // For funded loans, calculate based on time remaining
  const timeRemaining = getLoanTimeRemaining(loan);
  const totalDuration = Number(loan.duration);
  
  if (timeRemaining <= 0) {
    // Overdue - health decreases with time
    const daysOverdue = Math.abs(timeRemaining) / 86400;
    return Math.max(0, 50 - daysOverdue * 5);
  }
  
  // Active loan with time remaining
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
  return loans.reduce(
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

