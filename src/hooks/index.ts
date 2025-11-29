/**
 * MicroLoan Hooks - Centralized Exports
 */

// Core loan hooks
export { useLoans } from './useLoans';
export { useCreateLoan } from './useCreateLoan';
export { useFundLoan } from './useFundLoan';
export { useRepayLoan } from './useRepayLoan';
export { useLoanDetails } from './useLoanDetails';
export { useLoanHistory } from './useLoanHistory';

// Calculation hooks
export { useLoanCalculator } from './useLoanCalculator';
export { useInterestCalculation } from './useInterestCalculation';
export { useDefaultRisk, useQuickRiskLevel } from './useDefaultRisk';

// Collateral and repayment
export { useCollateral } from './useCollateral';
export { useRepayment } from './useRepayment';

// User hooks
export { useUserHistory } from './useUserHistory';
export { useUserReputation } from './useUserReputation';

// Filter and search hooks
export { useLoanFilters } from './useLoanFilters';
export { useLoanSearch } from './useLoanSearch';
export { useFilter } from './useFilter';
export { useSort } from './useSort';

// Statistics
export { useLoanStats } from './useLoanStats';

// Notification hooks
export { useLoanNotifications } from './useLoanNotifications';

// Wallet hooks
export { useWalletBalance } from './useWalletBalance';
export { useTransactionStatus } from './useTransactionStatus';

// Utility hooks
export { useAsync } from './useAsync';
export { useDebounce } from './useDebounce';
export { usePagination } from './usePagination';
export { useInfiniteScroll } from './useInfiniteScroll';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery } from './useMediaQuery';
export { useToggle } from './useToggle';
export { useCurrencyFormatter } from './useCurrencyFormatter';

// Type exports
export type { LoanFilters, FilterOptions, UseLoanFiltersReturn } from './useLoanFilters';
export type { SearchOptions, UseLoanSearchReturn } from './useLoanSearch';
export type { RiskLevel, RiskFactors, RiskAssessment, UseDefaultRiskReturn } from './useDefaultRisk';
export type { CreateLoanParams, CreateLoanStatus, LoanEstimate, UseCreateLoanReturn } from './useCreateLoan';
export type { CollateralInfo, UseCollateralReturn } from './useCollateral';
export type { RepaymentInfo, UseRepaymentReturn } from './useRepayment';
export type { LoanHistoryEntry, UseLoanHistoryReturn } from './useLoanHistory';
export type { InterestResult, UseInterestCalculationReturn } from './useInterestCalculation';
export type { LoanNotification, UseLoanNotificationsReturn } from './useLoanNotifications';
export type { UserReputation, UseUserReputationReturn } from './useUserReputation';
export type { LoanStats, UseLoanStatsReturn } from './useLoanStats';

