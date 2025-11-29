/**
 * APR/APY Conversion Utilities
 * Functions for annual percentage rate calculations
 */

// Time constants
const DAYS_PER_YEAR = 365;
const MONTHS_PER_YEAR = 12;
const WEEKS_PER_YEAR = 52;

export type CompoundingFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'continuous';

/**
 * Get compounding periods per year
 */
function getCompoundingPeriods(frequency: CompoundingFrequency): number {
  switch (frequency) {
    case 'daily':
      return DAYS_PER_YEAR;
    case 'weekly':
      return WEEKS_PER_YEAR;
    case 'monthly':
      return MONTHS_PER_YEAR;
    case 'quarterly':
      return 4;
    case 'annually':
      return 1;
    case 'continuous':
      return Infinity;
    default:
      return DAYS_PER_YEAR;
  }
}

/**
 * Convert APR to APY
 */
export function aprToApy(
  aprPercent: number,
  compounding: CompoundingFrequency = 'daily'
): number {
  const apr = aprPercent / 100;

  if (compounding === 'continuous') {
    // Continuous compounding: APY = e^APR - 1
    return (Math.exp(apr) - 1) * 100;
  }

  const n = getCompoundingPeriods(compounding);
  const apy = Math.pow(1 + apr / n, n) - 1;
  return Math.round(apy * 10000) / 100;
}

/**
 * Convert APY to APR
 */
export function apyToApr(
  apyPercent: number,
  compounding: CompoundingFrequency = 'daily'
): number {
  const apy = apyPercent / 100;

  if (compounding === 'continuous') {
    // Continuous compounding: APR = ln(1 + APY)
    return Math.log(1 + apy) * 100;
  }

  const n = getCompoundingPeriods(compounding);
  const apr = n * (Math.pow(1 + apy, 1 / n) - 1);
  return Math.round(apr * 10000) / 100;
}

/**
 * Calculate effective annual rate from periodic rate
 */
export function periodicToEffectiveRate(
  periodicRatePercent: number,
  periodsPerYear: number
): number {
  const periodicRate = periodicRatePercent / 100;
  const effectiveRate = Math.pow(1 + periodicRate, periodsPerYear) - 1;
  return Math.round(effectiveRate * 10000) / 100;
}

/**
 * Calculate periodic rate from effective annual rate
 */
export function effectiveToPeriodicRate(
  effectiveRatePercent: number,
  periodsPerYear: number
): number {
  const effectiveRate = effectiveRatePercent / 100;
  const periodicRate = Math.pow(1 + effectiveRate, 1 / periodsPerYear) - 1;
  return Math.round(periodicRate * 10000) / 100;
}

/**
 * Calculate APR from loan terms
 */
export function calculateAPRFromLoan(
  principal: number,
  totalPayment: number,
  durationDays: number
): number {
  const totalInterest = totalPayment - principal;
  const years = durationDays / DAYS_PER_YEAR;
  const apr = (totalInterest / principal / years) * 100;
  return Math.round(apr * 100) / 100;
}

/**
 * Calculate APR from interest rate and duration
 */
export function annualizeRate(
  periodRatePercent: number,
  periodDays: number
): number {
  const periodsPerYear = DAYS_PER_YEAR / periodDays;
  return Math.round(periodRatePercent * periodsPerYear * 100) / 100;
}

/**
 * Calculate period rate from annual rate
 */
export function deannualizeRate(
  annualRatePercent: number,
  periodDays: number
): number {
  const periodsPerYear = DAYS_PER_YEAR / periodDays;
  return Math.round((annualRatePercent / periodsPerYear) * 10000) / 10000;
}

/**
 * Compare APR vs APY
 */
export function compareRates(
  rate1: { value: number; type: 'apr' | 'apy'; compounding?: CompoundingFrequency },
  rate2: { value: number; type: 'apr' | 'apy'; compounding?: CompoundingFrequency }
): { difference: number; better: 1 | 2 | 'equal' } {
  // Convert both to APY for fair comparison
  const apy1 = rate1.type === 'apy' ? rate1.value : aprToApy(rate1.value, rate1.compounding);
  const apy2 = rate2.type === 'apy' ? rate2.value : aprToApy(rate2.value, rate2.compounding);

  const difference = Math.round(Math.abs(apy1 - apy2) * 100) / 100;
  const better = apy1 < apy2 ? 1 : apy1 > apy2 ? 2 : 'equal';

  return { difference, better };
}

/**
 * Calculate real rate accounting for inflation
 */
export function calculateRealRate(
  nominalRatePercent: number,
  inflationRatePercent: number
): number {
  const nominalRate = nominalRatePercent / 100;
  const inflationRate = inflationRatePercent / 100;
  const realRate = ((1 + nominalRate) / (1 + inflationRate)) - 1;
  return Math.round(realRate * 10000) / 100;
}

/**
 * Format rate for display
 */
export function formatRate(
  rate: number,
  type: 'apr' | 'apy',
  decimals: number = 2
): string {
  return `${rate.toFixed(decimals)}% ${type.toUpperCase()}`;
}

/**
 * Get rate comparison description
 */
export function getRateComparisonText(
  rate: number,
  type: 'apr' | 'apy',
  benchmark: number = 8
): string {
  const diff = rate - benchmark;
  if (Math.abs(diff) < 0.5) return 'Near market average';
  if (diff < 0) return `${Math.abs(diff).toFixed(1)}% below average`;
  return `${diff.toFixed(1)}% above average`;
}

/**
 * Calculate yield over period
 */
export function calculateYield(
  principal: number,
  apyPercent: number,
  durationDays: number
): number {
  const years = durationDays / DAYS_PER_YEAR;
  const apy = apyPercent / 100;
  const endValue = principal * Math.pow(1 + apy, years);
  return Math.round((endValue - principal) * 100) / 100;
}

/**
 * Calculate break-even rate
 */
export function calculateBreakEvenRate(
  costs: number,
  principal: number,
  durationDays: number
): number {
  const years = durationDays / DAYS_PER_YEAR;
  const breakEvenRate = (costs / principal / years) * 100;
  return Math.round(breakEvenRate * 100) / 100;
}

export { DAYS_PER_YEAR, MONTHS_PER_YEAR, WEEKS_PER_YEAR };

