/**
 * MicroLoan Utilities
 * Centralized exports for all utility functions
 */

// Interest calculation utilities
export * from './interest';

// Risk assessment utilities
export * from './risk';

// Collateral utilities
export * from './collateral';

// Repayment utilities
export * from './repayment';

// Loan term utilities
export * from './term';

// Penalty calculation utilities
export * from './penalty';

// APR/APY conversion utilities
export * from './apr';

// Credit score utilities
export * from './score';

// Threshold utilities
export * from './threshold';

// Duration utilities
export * from './duration';

// Common utility types
export interface MathPrecision {
  decimals: number;
  roundingMode: 'up' | 'down' | 'nearest';
}

// Constants
export const DEFAULT_PRECISION: MathPrecision = {
  decimals: 18,
  roundingMode: 'down',
};

export const SECONDS_PER_DAY = 86400;
export const SECONDS_PER_YEAR = 31536000;
export const DAYS_PER_YEAR = 365;

// Basis points
export const BASIS_POINTS = 10000;
export const PERCENTAGE_FACTOR = 100;

/**
 * Safe BigInt division with precision
 */
export function safeDivide(
  numerator: bigint,
  denominator: bigint,
  precision: number = 18
): bigint {
  if (denominator === BigInt(0)) {
    throw new Error('Division by zero');
  }
  
  const factor = BigInt(10 ** precision);
  return (numerator * factor) / denominator;
}

/**
 * Safe BigInt multiplication avoiding overflow
 */
export function safeMultiply(
  a: bigint,
  b: bigint,
  divisor: bigint = BigInt(1)
): bigint {
  if (divisor === BigInt(0)) {
    throw new Error('Division by zero');
  }
  
  return (a * b) / divisor;
}

/**
 * Convert BigInt to number safely
 */
export function bigintToNumber(value: bigint, decimals: number = 18): number {
  const divisor = BigInt(10 ** decimals);
  return Number(value) / Number(divisor);
}

/**
 * Convert number to BigInt
 */
export function numberToBigint(value: number, decimals: number = 18): bigint {
  const multiplier = 10 ** decimals;
  return BigInt(Math.floor(value * multiplier));
}

/**
 * Format BigInt as string with decimals
 */
export function formatBigint(
  value: bigint,
  decimals: number = 18,
  displayDecimals: number = 4
): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = value / divisor;
  const fractionalPart = value % divisor;
  
  const fractionalStr = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .slice(0, displayDecimals);
  
  return `${integerPart}.${fractionalStr}`;
}

/**
 * Parse string to BigInt with decimals
 */
export function parseToBigint(value: string, decimals: number = 18): bigint {
  const [integerPart, fractionalPart = ''] = value.split('.');
  
  const paddedFractional = fractionalPart
    .slice(0, decimals)
    .padEnd(decimals, '0');
  
  return BigInt(integerPart + paddedFractional);
}

/**
 * Calculate percentage of value
 */
export function percentageOf(
  value: bigint,
  percentage: number,
  precision: number = 4
): bigint {
  const factor = BigInt(10 ** precision);
  const percentageBigInt = BigInt(Math.floor(percentage * Number(factor)));
  return (value * percentageBigInt) / (factor * BigInt(100));
}

/**
 * Calculate percentage between two values
 */
export function calculatePercentage(
  numerator: bigint,
  denominator: bigint,
  precision: number = 4
): number {
  if (denominator === BigInt(0)) return 0;
  
  const factor = BigInt(10 ** (precision + 2)); // +2 for percentage
  const result = (numerator * factor) / denominator;
  return Number(result) / (10 ** precision);
}

/**
 * Min of two BigInts
 */
export function minBigint(a: bigint, b: bigint): bigint {
  return a < b ? a : b;
}

/**
 * Max of two BigInts
 */
export function maxBigint(a: bigint, b: bigint): bigint {
  return a > b ? a : b;
}

/**
 * Clamp BigInt between min and max
 */
export function clampBigint(value: bigint, min: bigint, max: bigint): bigint {
  return minBigint(maxBigint(value, min), max);
}

/**
 * Check if value is within range
 */
export function isInRange(
  value: bigint,
  min: bigint,
  max: bigint
): boolean {
  return value >= min && value <= max;
}

/**
 * Format timestamp to date string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Add days to timestamp
 */
export function addDays(timestamp: number, days: number): number {
  return timestamp + days * SECONDS_PER_DAY;
}

/**
 * Calculate days between timestamps
 */
export function daysBetween(start: number, end: number): number {
  return Math.floor((end - start) / SECONDS_PER_DAY);
}
