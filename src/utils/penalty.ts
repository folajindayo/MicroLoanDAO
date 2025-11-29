/**
 * Penalty Calculation Utilities
 * Functions for calculating late fees and penalties
 */

export interface PenaltyCalculation {
  basePenalty: number;
  escalatedPenalty: number;
  totalPenalty: number;
  daysLate: number;
  escalationLevel: number;
}

export interface PenaltyConfig {
  baseFeePercent: number;
  dailyFeePercent: number;
  maxPenaltyPercent: number;
  gracePeriodDays: number;
  escalationThresholds: number[];
  escalationMultipliers: number[];
}

// Default penalty configuration
const DEFAULT_PENALTY_CONFIG: PenaltyConfig = {
  baseFeePercent: 5,
  dailyFeePercent: 0.1,
  maxPenaltyPercent: 25,
  gracePeriodDays: 3,
  escalationThresholds: [7, 14, 30, 60],
  escalationMultipliers: [1, 1.5, 2, 2.5, 3],
};

/**
 * Calculate days late
 */
export function calculateDaysLate(
  dueTimestamp: number,
  currentTimestamp?: number
): number {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const secondsLate = Math.max(0, now - dueTimestamp);
  return Math.floor(secondsLate / 86400);
}

/**
 * Get escalation level based on days late
 */
export function getEscalationLevel(
  daysLate: number,
  thresholds: number[] = DEFAULT_PENALTY_CONFIG.escalationThresholds
): number {
  let level = 0;
  for (const threshold of thresholds) {
    if (daysLate >= threshold) {
      level++;
    } else {
      break;
    }
  }
  return level;
}

/**
 * Calculate late fee
 */
export function calculateLateFee(
  principal: number,
  dueTimestamp: number,
  config: Partial<PenaltyConfig> = {},
  currentTimestamp?: number
): PenaltyCalculation {
  const fullConfig = { ...DEFAULT_PENALTY_CONFIG, ...config };
  const daysLate = calculateDaysLate(dueTimestamp, currentTimestamp);

  // Within grace period
  if (daysLate <= fullConfig.gracePeriodDays) {
    return {
      basePenalty: 0,
      escalatedPenalty: 0,
      totalPenalty: 0,
      daysLate,
      escalationLevel: 0,
    };
  }

  const effectiveDaysLate = daysLate - fullConfig.gracePeriodDays;
  const escalationLevel = getEscalationLevel(effectiveDaysLate, fullConfig.escalationThresholds);
  const multiplier = fullConfig.escalationMultipliers[escalationLevel] || 1;

  // Calculate base fee
  const basePenalty = (principal * fullConfig.baseFeePercent) / 100;

  // Calculate daily fee with escalation
  const dailyPenalty = (principal * fullConfig.dailyFeePercent * effectiveDaysLate * multiplier) / 100;

  // Calculate escalated penalty
  const escalatedPenalty = dailyPenalty;

  // Apply maximum cap
  const maxPenalty = (principal * fullConfig.maxPenaltyPercent) / 100;
  const totalPenalty = Math.min(basePenalty + escalatedPenalty, maxPenalty);

  return {
    basePenalty: Math.round(basePenalty * 100) / 100,
    escalatedPenalty: Math.round(escalatedPenalty * 100) / 100,
    totalPenalty: Math.round(totalPenalty * 100) / 100,
    daysLate,
    escalationLevel,
  };
}

/**
 * Calculate total amount due including penalty
 */
export function calculateTotalDueWithPenalty(
  principal: number,
  interest: number,
  dueTimestamp: number,
  config: Partial<PenaltyConfig> = {},
  currentTimestamp?: number
): { principal: number; interest: number; penalty: number; total: number } {
  const penaltyCalc = calculateLateFee(principal, dueTimestamp, config, currentTimestamp);
  const total = principal + interest + penaltyCalc.totalPenalty;

  return {
    principal,
    interest,
    penalty: penaltyCalc.totalPenalty,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Calculate projected penalty at future date
 */
export function projectPenalty(
  principal: number,
  dueTimestamp: number,
  futureDays: number,
  config: Partial<PenaltyConfig> = {}
): PenaltyCalculation {
  const futureTimestamp = Math.floor(Date.now() / 1000) + futureDays * 86400;
  return calculateLateFee(principal, dueTimestamp, config, futureTimestamp);
}

/**
 * Get penalty warning level
 */
export function getPenaltyWarningLevel(
  daysLate: number,
  gracePeriodDays: number = DEFAULT_PENALTY_CONFIG.gracePeriodDays
): 'none' | 'grace' | 'warning' | 'critical' {
  if (daysLate <= 0) return 'none';
  if (daysLate <= gracePeriodDays) return 'grace';
  if (daysLate <= 14) return 'warning';
  return 'critical';
}

/**
 * Get penalty warning message
 */
export function getPenaltyWarningMessage(
  daysLate: number,
  gracePeriodDays: number = DEFAULT_PENALTY_CONFIG.gracePeriodDays
): string {
  const level = getPenaltyWarningLevel(daysLate, gracePeriodDays);

  switch (level) {
    case 'none':
      return 'Payment is on time';
    case 'grace':
      return `Payment is ${daysLate} day(s) late but within grace period`;
    case 'warning':
      return `Payment is ${daysLate} day(s) late. Late fees are being applied`;
    case 'critical':
      return `Payment is ${daysLate} day(s) overdue. Maximum penalties may apply`;
    default:
      return '';
  }
}

/**
 * Get penalty color class
 */
export function getPenaltyColorClass(level: 'none' | 'grace' | 'warning' | 'critical'): string {
  const classes: Record<typeof level, string> = {
    none: 'text-green-600 dark:text-green-400',
    grace: 'text-yellow-600 dark:text-yellow-400',
    warning: 'text-orange-600 dark:text-orange-400',
    critical: 'text-red-600 dark:text-red-400',
  };
  return classes[level];
}

/**
 * Format penalty amount
 */
export function formatPenalty(amount: number, currency: string = 'ETH'): string {
  return `${amount.toFixed(4)} ${currency}`;
}

/**
 * Check if penalty waiver is applicable
 */
export function canWaivePenalty(
  daysLate: number,
  previousWaivers: number,
  maxWaivers: number = 1
): boolean {
  return daysLate <= 7 && previousWaivers < maxWaivers;
}

/**
 * Calculate penalty reduction for early partial payment
 */
export function calculatePartialPaymentReduction(
  totalDue: number,
  amountPaid: number,
  penalty: number
): number {
  const paymentRatio = Math.min(1, amountPaid / totalDue);
  const reduction = penalty * paymentRatio * 0.5; // 50% of proportional penalty
  return Math.round(reduction * 100) / 100;
}

export { DEFAULT_PENALTY_CONFIG };

