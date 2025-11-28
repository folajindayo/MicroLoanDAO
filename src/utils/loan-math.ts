/**
 * Loan calculation utilities
 */

import { formatEther, parseEther } from 'viem';

/**
 * Calculates simple interest
 * Interest = Principal × Rate × Time
 */
export function calculateSimpleInterest(
  principal: bigint,
  rateInBps: number,
  durationInSeconds: number
): bigint {
  // Rate is in basis points (100 bps = 1%)
  // For simplicity, we calculate total interest for the loan period
  return (principal * BigInt(rateInBps)) / BigInt(10000);
}

/**
 * Calculates total repayment amount
 */
export function calculateTotalRepayment(
  principal: bigint,
  rateInBps: number
): bigint {
  const interest = calculateSimpleInterest(principal, rateInBps, 0);
  return principal + interest;
}

/**
 * Calculates repayment breakdown
 */
export function calculateRepaymentBreakdown(
  principal: bigint,
  rateInBps: number
): {
  principal: bigint;
  interest: bigint;
  total: bigint;
  principalFormatted: string;
  interestFormatted: string;
  totalFormatted: string;
} {
  const interest = calculateSimpleInterest(principal, rateInBps, 0);
  const total = principal + interest;
  
  return {
    principal,
    interest,
    total,
    principalFormatted: parseFloat(formatEther(principal)).toFixed(4),
    interestFormatted: parseFloat(formatEther(interest)).toFixed(4),
    totalFormatted: parseFloat(formatEther(total)).toFixed(4),
  };
}

/**
 * Calculates APR from interest rate and duration
 * APR = (Interest Rate / Duration in Days) × 365
 */
export function calculateAPR(rateInBps: number, durationInDays: number): number {
  if (durationInDays === 0) return 0;
  const ratePercentage = rateInBps / 100;
  return (ratePercentage / durationInDays) * 365;
}

/**
 * Converts duration from days to seconds
 */
export function daysToSeconds(days: number): number {
  return days * 24 * 60 * 60;
}

/**
 * Converts duration from seconds to days
 */
export function secondsToDays(seconds: number): number {
  return seconds / (24 * 60 * 60);
}

/**
 * Calculates due date from funded timestamp and duration
 */
export function calculateDueDate(fundedAt: Date | number, durationInSeconds: number): Date {
  const fundedTime = fundedAt instanceof Date ? fundedAt.getTime() : fundedAt * 1000;
  return new Date(fundedTime + durationInSeconds * 1000);
}

/**
 * Checks if a loan is overdue
 */
export function isLoanOverdue(fundedAt: Date | number, durationInSeconds: number): boolean {
  const dueDate = calculateDueDate(fundedAt, durationInSeconds);
  return new Date() > dueDate;
}

/**
 * Calculates time remaining until due date
 */
export function calculateTimeRemaining(
  fundedAt: Date | number,
  durationInSeconds: number
): number {
  const dueDate = calculateDueDate(fundedAt, durationInSeconds);
  const remaining = dueDate.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 1000));
}

/**
 * Calculates loan progress percentage
 */
export function calculateLoanProgress(
  fundedAt: Date | number,
  durationInSeconds: number
): number {
  const fundedTime = fundedAt instanceof Date ? fundedAt.getTime() : fundedAt * 1000;
  const elapsed = Date.now() - fundedTime;
  const totalDuration = durationInSeconds * 1000;
  
  if (totalDuration === 0) return 100;
  
  const progress = (elapsed / totalDuration) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Validates loan parameters
 */
export function validateLoanParams(params: {
  amount: string;
  durationDays: number;
  interestRate: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate amount
  try {
    const amount = parseFloat(params.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.push('Amount must be a positive number');
    } else if (amount < 0.001) {
      errors.push('Minimum loan amount is 0.001 ETH');
    } else if (amount > 1000) {
      errors.push('Maximum loan amount is 1000 ETH');
    }
  } catch {
    errors.push('Invalid amount format');
  }
  
  // Validate duration
  if (params.durationDays <= 0) {
    errors.push('Duration must be positive');
  } else if (params.durationDays < 1) {
    errors.push('Minimum duration is 1 day');
  } else if (params.durationDays > 365) {
    errors.push('Maximum duration is 365 days');
  }
  
  // Validate interest rate
  if (params.interestRate < 0) {
    errors.push('Interest rate cannot be negative');
  } else if (params.interestRate > 100) {
    errors.push('Interest rate cannot exceed 100%');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Estimates monthly payment for a loan (simplified)
 */
export function estimateMonthlyPayment(
  principal: bigint,
  rateInBps: number,
  durationInDays: number
): bigint {
  const total = calculateTotalRepayment(principal, rateInBps);
  const months = Math.ceil(durationInDays / 30);
  
  if (months === 0) return total;
  return total / BigInt(months);
}

/**
 * Calculates late fee percentage based on days overdue
 */
export function calculateLateFeePercentage(daysOverdue: number): number {
  if (daysOverdue <= 0) return 0;
  if (daysOverdue <= 7) return 1;
  if (daysOverdue <= 14) return 2;
  if (daysOverdue <= 30) return 5;
  return 10;
}

/**
 * Calculates loan-to-value ratio
 */
export function calculateLTV(loanAmount: bigint, collateralValue: bigint): number {
  if (collateralValue === BigInt(0)) return Infinity;
  return Number((loanAmount * BigInt(100)) / collateralValue);
}

/**
 * Generates a loan summary
 */
export function generateLoanSummary(loan: {
  amount: bigint;
  interestRate: number;
  duration: number;
  fundedAt?: Date | number;
}): {
  principal: string;
  interest: string;
  total: string;
  apr: string;
  dueDate?: string;
  progress?: number;
} {
  const breakdown = calculateRepaymentBreakdown(loan.amount, loan.interestRate);
  const apr = calculateAPR(loan.interestRate, secondsToDays(loan.duration));
  
  const summary: {
    principal: string;
    interest: string;
    total: string;
    apr: string;
    dueDate?: string;
    progress?: number;
  } = {
    principal: `${breakdown.principalFormatted} ETH`,
    interest: `${breakdown.interestFormatted} ETH`,
    total: `${breakdown.totalFormatted} ETH`,
    apr: `${apr.toFixed(2)}%`,
  };
  
  if (loan.fundedAt) {
    const dueDate = calculateDueDate(loan.fundedAt, loan.duration);
    summary.dueDate = dueDate.toLocaleDateString();
    summary.progress = calculateLoanProgress(loan.fundedAt, loan.duration);
  }
  
  return summary;
}

export default {
  calculateSimpleInterest,
  calculateTotalRepayment,
  calculateRepaymentBreakdown,
  calculateAPR,
  daysToSeconds,
  secondsToDays,
  calculateDueDate,
  isLoanOverdue,
  calculateTimeRemaining,
  calculateLoanProgress,
  validateLoanParams,
  estimateMonthlyPayment,
  calculateLateFeePercentage,
  calculateLTV,
  generateLoanSummary,
};

