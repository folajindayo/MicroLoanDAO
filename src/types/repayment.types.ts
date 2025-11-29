/**
 * Repayment Types
 * Type definitions for loan repayment operations
 */

import { type Address } from 'viem';

/**
 * Repayment status
 */
export type RepaymentStatus = 
  | 'scheduled'
  | 'due'
  | 'overdue'
  | 'paid'
  | 'partial'
  | 'waived'
  | 'defaulted';

/**
 * Payment method
 */
export type PaymentMethod = 
  | 'wallet'
  | 'scheduled'
  | 'auto_debit'
  | 'third_party';

/**
 * Repayment schedule item
 */
export interface RepaymentScheduleItem {
  id: string;
  loanId: bigint;
  paymentNumber: number;
  dueDate: Date;
  principalAmount: bigint;
  interestAmount: bigint;
  feeAmount: bigint;
  totalAmount: bigint;
  paidAmount: bigint;
  status: RepaymentStatus;
  paidAt?: Date;
  transactionHash?: string;
}

/**
 * Repayment schedule
 */
export interface RepaymentSchedule {
  loanId: bigint;
  borrower: Address;
  totalPrincipal: bigint;
  totalInterest: bigint;
  totalFees: bigint;
  totalAmount: bigint;
  paidAmount: bigint;
  remainingAmount: bigint;
  frequency: RepaymentFrequency;
  items: RepaymentScheduleItem[];
  nextDueDate?: Date;
  isComplete: boolean;
}

/**
 * Repayment frequency
 */
export type RepaymentFrequency = 
  | 'one_time'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'custom';

/**
 * Repayment calculation
 */
export interface RepaymentCalculation {
  principal: bigint;
  interest: bigint;
  lateFee: bigint;
  penalty: bigint;
  total: bigint;
  breakdown: {
    label: string;
    amount: bigint;
    percentage: number;
  }[];
}

/**
 * Repayment transaction
 */
export interface RepaymentTransaction {
  id: string;
  loanId: bigint;
  scheduleItemId?: string;
  payer: Address;
  amount: bigint;
  principalPaid: bigint;
  interestPaid: bigint;
  feesPaid: bigint;
  method: PaymentMethod;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash: string;
  blockNumber?: number;
  timestamp: Date;
}

/**
 * Early repayment calculation
 */
export interface EarlyRepaymentInfo {
  loanId: bigint;
  asOfDate: Date;
  remainingPrincipal: bigint;
  accruedInterest: bigint;
  earlyPaymentFee: bigint;
  totalPayoff: bigint;
  interestSaved: bigint;
  daysEarly: number;
}

/**
 * Partial payment request
 */
export interface PartialPaymentRequest {
  loanId: bigint;
  amount: bigint;
  appliesTo: 'principal' | 'interest' | 'fees' | 'proportional';
}

/**
 * Payment reminder
 */
export interface PaymentReminder {
  id: string;
  loanId: bigint;
  borrower: Address;
  scheduleItemId: string;
  dueDate: Date;
  amount: bigint;
  daysBefore: number;
  sent: boolean;
  sentAt?: Date;
  channel: 'email' | 'push' | 'sms';
}

/**
 * Repayment history
 */
export interface RepaymentHistoryItem {
  id: string;
  loanId: bigint;
  type: 'payment' | 'late_fee' | 'waiver' | 'adjustment';
  amount: bigint;
  balanceBefore: bigint;
  balanceAfter: bigint;
  timestamp: Date;
  transactionHash?: string;
  note?: string;
}

/**
 * Repayment statistics
 */
export interface RepaymentStatistics {
  totalPayments: number;
  onTimePayments: number;
  latePayments: number;
  missedPayments: number;
  totalPaid: bigint;
  totalLateFees: bigint;
  averagePaymentDelay: number;
  longestStreak: number;
  currentStreak: number;
}

/**
 * Auto-debit configuration
 */
export interface AutoDebitConfig {
  id: string;
  loanId: bigint;
  borrower: Address;
  isEnabled: boolean;
  paymentMethod: PaymentMethod;
  daysBeforeDue: number;
  maxAmount?: bigint;
  notifyBeforeDebit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repayment summary for UI
 */
export interface RepaymentSummary {
  loanId: bigint;
  totalOwed: bigint;
  minimumPayment: bigint;
  nextDueDate: Date;
  daysUntilDue: number;
  isOverdue: boolean;
  overdueAmount: bigint;
  overdueCount: number;
  paymentProgress: number;
}

