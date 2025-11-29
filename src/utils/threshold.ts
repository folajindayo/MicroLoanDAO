/**
 * Threshold and Limit Utilities
 * Functions for calculating and enforcing loan limits
 */

export interface LimitConfig {
  minLoanAmount: number;
  maxLoanAmount: number;
  minDuration: number;
  maxDuration: number;
  minInterestRate: number;
  maxInterestRate: number;
  maxActiveLoans: number;
  maxTotalExposure: number;
}

export interface ThresholdCheck {
  passed: boolean;
  violations: ThresholdViolation[];
}

export interface ThresholdViolation {
  field: string;
  value: number;
  limit: number;
  type: 'min' | 'max';
  message: string;
}

// Default limits
const DEFAULT_LIMITS: LimitConfig = {
  minLoanAmount: 0.001,
  maxLoanAmount: 1000,
  minDuration: 1,
  maxDuration: 365,
  minInterestRate: 0.01,
  maxInterestRate: 100,
  maxActiveLoans: 10,
  maxTotalExposure: 10000,
};

/**
 * Check if value is within range
 */
export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Clamp value to range
 */
export function clampToRange(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Check loan amount threshold
 */
export function checkAmountThreshold(
  amount: number,
  config: Partial<LimitConfig> = {}
): ThresholdCheck {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const violations: ThresholdViolation[] = [];

  if (amount < limits.minLoanAmount) {
    violations.push({
      field: 'amount',
      value: amount,
      limit: limits.minLoanAmount,
      type: 'min',
      message: `Amount must be at least ${limits.minLoanAmount}`,
    });
  }

  if (amount > limits.maxLoanAmount) {
    violations.push({
      field: 'amount',
      value: amount,
      limit: limits.maxLoanAmount,
      type: 'max',
      message: `Amount cannot exceed ${limits.maxLoanAmount}`,
    });
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Check duration threshold
 */
export function checkDurationThreshold(
  durationDays: number,
  config: Partial<LimitConfig> = {}
): ThresholdCheck {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const violations: ThresholdViolation[] = [];

  if (durationDays < limits.minDuration) {
    violations.push({
      field: 'duration',
      value: durationDays,
      limit: limits.minDuration,
      type: 'min',
      message: `Duration must be at least ${limits.minDuration} day(s)`,
    });
  }

  if (durationDays > limits.maxDuration) {
    violations.push({
      field: 'duration',
      value: durationDays,
      limit: limits.maxDuration,
      type: 'max',
      message: `Duration cannot exceed ${limits.maxDuration} days`,
    });
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Check interest rate threshold
 */
export function checkInterestRateThreshold(
  rate: number,
  config: Partial<LimitConfig> = {}
): ThresholdCheck {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const violations: ThresholdViolation[] = [];

  if (rate < limits.minInterestRate) {
    violations.push({
      field: 'interestRate',
      value: rate,
      limit: limits.minInterestRate,
      type: 'min',
      message: `Interest rate must be at least ${limits.minInterestRate}%`,
    });
  }

  if (rate > limits.maxInterestRate) {
    violations.push({
      field: 'interestRate',
      value: rate,
      limit: limits.maxInterestRate,
      type: 'max',
      message: `Interest rate cannot exceed ${limits.maxInterestRate}%`,
    });
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Check all loan thresholds
 */
export function checkAllThresholds(
  params: { amount: number; durationDays: number; interestRate: number },
  config: Partial<LimitConfig> = {}
): ThresholdCheck {
  const amountCheck = checkAmountThreshold(params.amount, config);
  const durationCheck = checkDurationThreshold(params.durationDays, config);
  const rateCheck = checkInterestRateThreshold(params.interestRate, config);

  const allViolations = [
    ...amountCheck.violations,
    ...durationCheck.violations,
    ...rateCheck.violations,
  ];

  return { passed: allViolations.length === 0, violations: allViolations };
}

/**
 * Check active loans limit
 */
export function checkActiveLoansLimit(
  currentActiveLoans: number,
  config: Partial<LimitConfig> = {}
): ThresholdCheck {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const violations: ThresholdViolation[] = [];

  if (currentActiveLoans >= limits.maxActiveLoans) {
    violations.push({
      field: 'activeLoans',
      value: currentActiveLoans,
      limit: limits.maxActiveLoans,
      type: 'max',
      message: `Maximum ${limits.maxActiveLoans} active loans allowed`,
    });
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Check total exposure limit
 */
export function checkExposureLimit(
  currentExposure: number,
  newLoanAmount: number,
  config: Partial<LimitConfig> = {}
): ThresholdCheck {
  const limits = { ...DEFAULT_LIMITS, ...config };
  const violations: ThresholdViolation[] = [];
  const totalExposure = currentExposure + newLoanAmount;

  if (totalExposure > limits.maxTotalExposure) {
    violations.push({
      field: 'exposure',
      value: totalExposure,
      limit: limits.maxTotalExposure,
      type: 'max',
      message: `Total exposure cannot exceed ${limits.maxTotalExposure}`,
    });
  }

  return { passed: violations.length === 0, violations };
}

/**
 * Calculate remaining capacity
 */
export function calculateRemainingCapacity(
  currentExposure: number,
  config: Partial<LimitConfig> = {}
): number {
  const limits = { ...DEFAULT_LIMITS, ...config };
  return Math.max(0, limits.maxTotalExposure - currentExposure);
}

/**
 * Get utilization percentage
 */
export function calculateUtilization(
  currentExposure: number,
  config: Partial<LimitConfig> = {}
): number {
  const limits = { ...DEFAULT_LIMITS, ...config };
  return Math.round((currentExposure / limits.maxTotalExposure) * 10000) / 100;
}

/**
 * Get limit configuration
 */
export function getLimits(config: Partial<LimitConfig> = {}): LimitConfig {
  return { ...DEFAULT_LIMITS, ...config };
}

/**
 * Format violation message
 */
export function formatViolation(violation: ThresholdViolation): string {
  return violation.message;
}

/**
 * Format all violations
 */
export function formatViolations(check: ThresholdCheck): string[] {
  return check.violations.map(formatViolation);
}

export { DEFAULT_LIMITS };

