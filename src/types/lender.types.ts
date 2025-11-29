/**
 * Lender Types
 * Type definitions for lender profiles and operations
 */

import { type Address } from 'viem';

/**
 * Lender status
 */
export type LenderStatus = 
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'paused';

/**
 * Lender tier
 */
export type LenderTier = 
  | 'starter'
  | 'standard'
  | 'premium'
  | 'institutional';

/**
 * Lender profile
 */
export interface LenderProfile {
  address: Address;
  ensName?: string;
  status: LenderStatus;
  tier: LenderTier;
  totalLent: bigint;
  totalRepaid: bigint;
  totalEarned: bigint;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  averageInterestRate: number;
  memberSince: Date;
  lastActivity: Date;
  verificationStatus: 'unverified' | 'verified' | 'institutional';
}

/**
 * Lender portfolio
 */
export interface LenderPortfolio {
  address: Address;
  totalValue: bigint;
  availableBalance: bigint;
  lockedBalance: bigint;
  pendingReturns: bigint;
  activeLoans: ActiveLoanSummary[];
  allocation: PortfolioAllocation;
  performance: PortfolioPerformance;
}

/**
 * Active loan summary
 */
export interface ActiveLoanSummary {
  loanId: bigint;
  borrower: Address;
  principalAmount: bigint;
  remainingPrincipal: bigint;
  interestRate: number;
  nextPaymentDate: Date;
  status: 'current' | 'late' | 'defaulting';
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Portfolio allocation
 */
export interface PortfolioAllocation {
  byRisk: {
    low: number;
    medium: number;
    high: number;
  };
  byDuration: {
    short: number;
    medium: number;
    long: number;
  };
  byCollateral: {
    collateralized: number;
    uncollateralized: number;
  };
}

/**
 * Portfolio performance
 */
export interface PortfolioPerformance {
  totalReturn: bigint;
  returnPercentage: number;
  realizedGains: bigint;
  unrealizedGains: bigint;
  defaultLosses: bigint;
  netProfit: bigint;
  annualizedReturn: number;
}

/**
 * Lender preferences
 */
export interface LenderPreferences {
  address: Address;
  autoLending: AutoLendingConfig;
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  preferredDurations: number[];
  preferredCollateralTypes: string[];
  minInterestRate: number;
  maxLoanSize: bigint;
  notifications: LenderNotificationPrefs;
}

/**
 * Auto-lending configuration
 */
export interface AutoLendingConfig {
  enabled: boolean;
  maxExposure: bigint;
  minCreditScore: number;
  maxDefaultRate: number;
  preferredTerms: {
    minDuration: number;
    maxDuration: number;
    minAmount: bigint;
    maxAmount: bigint;
    minInterestRate: number;
  };
  excludedBorrowers: Address[];
  collateralRequired: boolean;
}

/**
 * Lender notification preferences
 */
export interface LenderNotificationPrefs {
  newOpportunities: boolean;
  fundingComplete: boolean;
  paymentReceived: boolean;
  latePayments: boolean;
  defaults: boolean;
  rateChanges: boolean;
  portfolioUpdates: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

/**
 * Lending opportunity
 */
export interface LendingOpportunity {
  loanId: bigint;
  borrower: Address;
  borrowerScore: number;
  requestedAmount: bigint;
  fundedAmount: bigint;
  remainingAmount: bigint;
  interestRate: number;
  duration: number;
  collateralRatio: number;
  riskLevel: 'low' | 'medium' | 'high';
  deadline: Date;
  matchScore: number;
  createdAt: Date;
}

/**
 * Lender transaction
 */
export interface LenderTransaction {
  id: string;
  address: Address;
  type: LenderTransactionType;
  loanId?: bigint;
  amount: bigint;
  timestamp: Date;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Lender transaction type
 */
export type LenderTransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'fund_loan'
  | 'receive_payment'
  | 'receive_interest'
  | 'write_off'
  | 'claim_collateral';

/**
 * Lender statistics
 */
export interface LenderStats {
  address: Address;
  stats: {
    totalLoans: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    totalLent: bigint;
    totalRepaid: bigint;
    totalInterestEarned: bigint;
    totalLosses: bigint;
    netProfit: bigint;
    averageLoanSize: bigint;
    averageInterestRate: number;
    defaultRate: number;
    recoveryRate: number;
  };
  period: 'all_time' | 'yearly' | 'monthly';
}

/**
 * Lender dashboard
 */
export interface LenderDashboard {
  profile: LenderProfile;
  portfolio: LenderPortfolio;
  recentTransactions: LenderTransaction[];
  opportunities: LendingOpportunity[];
  alerts: LenderAlert[];
  stats: {
    todayEarnings: bigint;
    weekEarnings: bigint;
    monthEarnings: bigint;
  };
}

/**
 * Lender alert
 */
export interface LenderAlert {
  id: string;
  type: 'opportunity' | 'payment' | 'late' | 'default' | 'rate' | 'general';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  loanId?: bigint;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

