/**
 * Borrower Types
 * Type definitions for borrower profiles and data
 */

import { type Address } from 'viem';

/**
 * Borrower verification status
 */
export type VerificationStatus = 
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'suspended';

/**
 * Borrower reputation tier
 */
export type ReputationTier = 
  | 'new'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond';

/**
 * Borrower profile
 */
export interface BorrowerProfile {
  address: Address;
  ensName?: string;
  verificationStatus: VerificationStatus;
  reputationScore: number;
  reputationTier: ReputationTier;
  totalBorrowed: bigint;
  totalRepaid: bigint;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  onTimePayments: number;
  latePayments: number;
  averagePaymentDelay: number;
  memberSince: Date;
  lastActivity: Date;
}

/**
 * Borrower credit score
 */
export interface BorrowerCreditScore {
  address: Address;
  score: number;
  maxScore: number;
  factors: CreditFactor[];
  lastCalculated: Date;
  trend: 'improving' | 'stable' | 'declining';
  changeFromLast: number;
}

/**
 * Credit scoring factor
 */
export interface CreditFactor {
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  impact: 'positive' | 'neutral' | 'negative';
  description: string;
}

/**
 * Borrower limits
 */
export interface BorrowerLimits {
  address: Address;
  maxBorrowAmount: bigint;
  maxActiveLoans: number;
  maxLoanDuration: number;
  minCollateralRatio: number;
  availableCredit: bigint;
  utilizationRate: number;
}

/**
 * Borrower activity
 */
export interface BorrowerActivity {
  id: string;
  address: Address;
  type: BorrowerActivityType;
  loanId?: bigint;
  amount?: bigint;
  timestamp: Date;
  transactionHash?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Borrower activity type
 */
export type BorrowerActivityType = 
  | 'loan_requested'
  | 'loan_funded'
  | 'payment_made'
  | 'payment_missed'
  | 'loan_completed'
  | 'loan_defaulted'
  | 'collateral_added'
  | 'collateral_withdrawn'
  | 'profile_updated'
  | 'verification_submitted'
  | 'verification_completed';

/**
 * Borrower statistics
 */
export interface BorrowerStats {
  address: Address;
  stats: {
    totalLoans: number;
    activeLoans: number;
    completedLoans: number;
    defaultedLoans: number;
    totalBorrowed: bigint;
    totalRepaid: bigint;
    totalInterestPaid: bigint;
    totalFeesPaid: bigint;
    averageLoanSize: bigint;
    averageLoanDuration: number;
    repaymentRate: number;
    onTimeRate: number;
  };
  period: 'all_time' | 'yearly' | 'monthly';
}

/**
 * Borrower verification request
 */
export interface VerificationRequest {
  id: string;
  borrower: Address;
  type: VerificationType;
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  expiresAt?: Date;
  documents?: VerificationDocument[];
  notes?: string;
}

/**
 * Verification type
 */
export type VerificationType = 
  | 'identity'
  | 'address'
  | 'income'
  | 'employment'
  | 'collateral';

/**
 * Verification document
 */
export interface VerificationDocument {
  id: string;
  type: string;
  name: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  url?: string;
}

/**
 * Borrower notification preferences
 */
export interface BorrowerNotificationPrefs {
  address: Address;
  email?: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  notifications: {
    paymentReminders: boolean;
    paymentConfirmations: boolean;
    loanUpdates: boolean;
    rateChanges: boolean;
    promotions: boolean;
    securityAlerts: boolean;
  };
  reminderDays: number[];
}

/**
 * Borrower dashboard data
 */
export interface BorrowerDashboard {
  profile: BorrowerProfile;
  creditScore: BorrowerCreditScore;
  limits: BorrowerLimits;
  activeLoans: {
    count: number;
    totalOwed: bigint;
    nextPayment?: {
      loanId: bigint;
      amount: bigint;
      dueDate: Date;
    };
  };
  recentActivity: BorrowerActivity[];
  alerts: BorrowerAlert[];
}

/**
 * Borrower alert
 */
export interface BorrowerAlert {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'rate_change' | 'limit_change' | 'verification' | 'general';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  loanId?: bigint;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

