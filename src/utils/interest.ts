/**
 * Interest Calculation Utilities
 * Functions for interest rate calculations and conversions
 */

// Basis points constants
const BPS_PRECISION = 10000;
const DAYS_PER_YEAR = 365;
const HOURS_PER_YEAR = 8760;

/**
 * Convert basis points to percentage
 */
export function bpsToPercent(bps: number): number {
  return bps / 100;
}

/**
 * Convert percentage to basis points
 */
export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}

/**
 * Calculate simple interest
 */
export function calculateSimpleInterest(
  principal: number,
  annualRatePercent: number,
  durationDays: number
): number {
  const rate = annualRatePercent / 100;
  const years = durationDays / DAYS_PER_YEAR;
  return principal * rate * years;
}

/**
 * Calculate simple interest with BigInt precision
 */
export function calculateSimpleInterestBigInt(
  principal: bigint,
  rateBps: bigint,
  durationSeconds: bigint
): bigint {
  const secondsPerYear = BigInt(365 * 24 * 60 * 60);
  return (principal * rateBps * durationSeconds) / (BigInt(BPS_PRECISION) * secondsPerYear);
}

/**
 * Calculate compound interest (daily compounding)
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  durationDays: number,
  compoundsPerYear: number = DAYS_PER_YEAR
): number {
  const rate = annualRatePercent / 100;
  const t = durationDays / DAYS_PER_YEAR;
  const amount = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * t);
  return amount - principal;
}

/**
 * Calculate continuous compound interest
 */
export function calculateContinuousInterest(
  principal: number,
  annualRatePercent: number,
  durationDays: number
): number {
  const rate = annualRatePercent / 100;
  const t = durationDays / DAYS_PER_YEAR;
  return principal * Math.exp(rate * t) - principal;
}

/**
 * Calculate daily interest rate from annual rate
 */
export function annualToDailyRate(annualRatePercent: number): number {
  return annualRatePercent / DAYS_PER_YEAR;
}

/**
 * Calculate annual rate from daily rate
 */
export function dailyToAnnualRate(dailyRatePercent: number): number {
  return dailyRatePercent * DAYS_PER_YEAR;
}

/**
 * Calculate hourly interest rate from annual rate
 */
export function annualToHourlyRate(annualRatePercent: number): number {
  return annualRatePercent / HOURS_PER_YEAR;
}

/**
 * Calculate total interest for a loan
 */
export function calculateTotalInterest(
  principal: number,
  annualRatePercent: number,
  durationDays: number,
  model: 'simple' | 'compound' | 'continuous' = 'simple'
): number {
  switch (model) {
    case 'compound':
      return calculateCompoundInterest(principal, annualRatePercent, durationDays);
    case 'continuous':
      return calculateContinuousInterest(principal, annualRatePercent, durationDays);
    default:
      return calculateSimpleInterest(principal, annualRatePercent, durationDays);
  }
}

/**
 * Calculate interest accrued per day
 */
export function calculateDailyInterest(principal: number, annualRatePercent: number): number {
  return principal * (annualRatePercent / 100 / DAYS_PER_YEAR);
}

/**
 * Calculate accrued interest up to a specific point
 */
export function calculateAccruedInterest(
  principal: number,
  annualRatePercent: number,
  startTimestamp: number,
  endTimestamp?: number
): number {
  const now = endTimestamp || Math.floor(Date.now() / 1000);
  const elapsedSeconds = Math.max(0, now - startTimestamp);
  const elapsedDays = elapsedSeconds / 86400;
  return calculateSimpleInterest(principal, annualRatePercent, elapsedDays);
}

/**
 * Calculate interest rate needed to achieve target return
 */
export function calculateRequiredRate(
  principal: number,
  targetReturn: number,
  durationDays: number
): number {
  const years = durationDays / DAYS_PER_YEAR;
  return (targetReturn / principal / years) * 100;
}

/**
 * Format interest rate for display
 */
export function formatInterestRate(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

/**
 * Format interest rate from basis points
 */
export function formatInterestRateBps(bps: number, decimals: number = 2): string {
  return formatInterestRate(bpsToPercent(bps), decimals);
}

/**
 * Compare two interest rates
 */
export function compareRates(rate1: number, rate2: number): 'higher' | 'lower' | 'equal' {
  if (Math.abs(rate1 - rate2) < 0.001) return 'equal';
  return rate1 > rate2 ? 'higher' : 'lower';
}

/**
 * Calculate effective interest rate considering fees
 */
export function calculateEffectiveRate(
  nominalRate: number,
  fees: number,
  principal: number,
  durationDays: number
): number {
  const interest = calculateSimpleInterest(principal, nominalRate, durationDays);
  const totalCost = interest + fees;
  const years = durationDays / DAYS_PER_YEAR;
  return (totalCost / principal / years) * 100;
}

export { BPS_PRECISION, DAYS_PER_YEAR, HOURS_PER_YEAR };

