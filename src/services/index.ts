/**
 * MicroLoan Services - Centralized Exports
 */

// Core loan services
export { loanService, LoanService } from './loan.service';
export {
  calculateRepayment,
  calculateAPR,
  getLoanDueDate,
  getLoanTimeRemaining,
  formatLoanDuration,
  canFundLoan,
  canRepayLoan,
  calculateLoanHealth,
  getLoanStatusColor,
  getLoanStatusLabel,
  calculateLoanSummary,
  sortLoans,
  filterLoansByStatus,
  filterLoans,
} from './loan.service';

// Collateral services
export { collateralService, CollateralService } from './collateral.service';

// Interest and pricing services
export { interestService, InterestService } from './interest.service';
export { pricingService, PricingService } from './pricing.service';

// Credit and risk services
export { creditService, CreditService, GRADE_THRESHOLDS } from './credit.service';

// User services
export { reputationService, ReputationService } from './reputation.service';

// Notification services
export { notificationService, NotificationService } from './notification.service';

// Analytics services
export { analyticsService, AnalyticsService } from './analytics.service';

// Liquidation services
export { liquidationService, LiquidationService } from './liquidation.service';

// Governance services
export { governanceService, GovernanceService } from './governance.service';

// History services
export { historyService, HistoryService } from './history.service';

// Batch operation services
export { batchService, BatchService } from './batch.service';

// Type exports
export type {
  LoanData,
  LoanCalculation,
  LoanSummary,
  LoanFilter,
  LoanSortCriteria,
} from './loan.service';

export type {
  CollateralAsset,
  CollateralPosition,
  CollateralRequirement,
} from './collateral.service';

export type {
  InterestCalculation,
  RateRecommendation,
  AccruedInterest,
  InterestModel,
} from './interest.service';

export type {
  CreditScore,
  CreditFactor,
  CreditGrade,
  CreditHistory,
  CreditLimit,
} from './credit.service';

export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationPreferences,
} from './notification.service';

export type {
  PlatformMetrics,
  UserMetrics,
  TimeSeriesPoint,
  LoanPerformance,
  TimeRange,
} from './analytics.service';

export type {
  LiquidationCandidate,
  LiquidationResult,
  AuctionState,
  LiquidationConfig,
} from './liquidation.service';

export type {
  Proposal,
  ProposalType,
  ProposalStatus,
  ProposalAction,
  Vote,
  VoteType,
  VotingPower,
  GovernanceConfig,
} from './governance.service';

export type {
  HistoryEvent,
  HistoryEventType,
  ActivitySummary,
  LoanHistory,
  HistoryTimeline,
  HistoryQuery,
} from './history.service';

export type {
  TokenPrice,
  PriceHistory,
  ExchangeRate,
  GasPrice,
} from './pricing.service';

export type {
  BatchJob,
  BatchOperationType,
  BatchStatus,
  BatchItem,
  BatchOptions,
} from './batch.service';

