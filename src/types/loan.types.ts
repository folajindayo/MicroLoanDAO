/**
 * Loan Types
 * Comprehensive type definitions for loan operations
 */

import { type Address } from 'viem';

/**
 * Loan status enum matching smart contract
 */
export enum LoanStatus {
  REQUESTED = 0,
  FUNDED = 1,
  REPAID = 2,
  DEFAULTED = 3,
}

/**
 * Core loan data structure from contract
 */
export interface Loan {
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

/**
 * Formatted loan for UI display
 */
export interface FormattedLoan {
  id: string;
  borrower: string;
  lender: string;
  amount: string;
  amountFormatted: string;
  interestRate: number;
  interestRateFormatted: string;
  purpose: string;
  durationDays: number;
  durationFormatted: string;
  requestedAt: Date;
  fundedAt: Date | null;
  repaidAt: Date | null;
  status: LoanStatus;
  statusLabel: string;
  statusColor: string;
  isActive: boolean;
  isOverdue: boolean;
  dueDate: Date | null;
  repaymentAmount: string;
}

/**
 * Loan creation parameters
 */
export interface CreateLoanParams {
  amount: string;
  duration: number;
  interestRate: number;
  purpose: string;
}

/**
 * Loan filter options
 */
export interface LoanFilters {
  status?: LoanStatus | 'all';
  borrower?: Address;
  lender?: Address;
  minAmount?: bigint;
  maxAmount?: bigint;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: LoanSortField;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Sortable loan fields
 */
export type LoanSortField = 
  | 'amount'
  | 'interestRate'
  | 'duration'
  | 'requestedAt'
  | 'fundedAt';

/**
 * Loan statistics
 */
export interface LoanStatistics {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalVolume: bigint;
  totalVolumeFormatted: string;
  averageLoanSize: bigint;
  averageInterestRate: number;
  averageDuration: number;
  defaultRate: number;
}

/**
 * User loan summary
 */
export interface UserLoanSummary {
  address: Address;
  asBorrower: {
    totalLoans: number;
    activeLoans: number;
    repaidLoans: number;
    defaultedLoans: number;
    totalBorrowed: bigint;
    totalRepaid: bigint;
    outstandingDebt: bigint;
  };
  asLender: {
    totalLoans: number;
    activeLoans: number;
    repaidLoans: number;
    defaultedLoans: number;
    totalLent: bigint;
    totalReturns: bigint;
    outstandingLoans: bigint;
  };
  reputationScore: number;
}

/**
 * Loan event types
 */
export interface LoanCreatedEvent {
  loanId: bigint;
  borrower: Address;
  amount: bigint;
  purpose: string;
  timestamp: bigint;
  transactionHash: string;
}

export interface LoanFundedEvent {
  loanId: bigint;
  lender: Address;
  amount: bigint;
  timestamp: bigint;
  transactionHash: string;
}

export interface LoanRepaidEvent {
  loanId: bigint;
  amount: bigint;
  interest: bigint;
  timestamp: bigint;
  transactionHash: string;
}

export interface LoanDefaultedEvent {
  loanId: bigint;
  borrower: Address;
  lender: Address;
  amount: bigint;
  timestamp: bigint;
  transactionHash: string;
}

/**
 * Union of all loan events
 */
export type LoanEvent = 
  | { type: 'created'; data: LoanCreatedEvent }
  | { type: 'funded'; data: LoanFundedEvent }
  | { type: 'repaid'; data: LoanRepaidEvent }
  | { type: 'defaulted'; data: LoanDefaultedEvent };

/**
 * Loan action types
 */
export type LoanAction = 'create' | 'fund' | 'repay' | 'default';

/**
 * Loan action result
 */
export interface LoanActionResult {
  success: boolean;
  action: LoanAction;
  loanId: bigint;
  transactionHash?: string;
  error?: string;
}

/**
 * Pagination parameters
 */
export interface LoanPaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

/**
 * Paginated loan response
 */
export interface PaginatedLoans {
  loans: Loan[];
  pagination: LoanPaginationParams & { total: number; totalPages: number };
}

