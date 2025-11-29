/**
 * Loan Term Utilities
 * Functions for loan term calculations and management
 */

export type TermUnit = 'days' | 'weeks' | 'months' | 'years';

export interface LoanTerm {
  value: number;
  unit: TermUnit;
  totalDays: number;
  totalSeconds: number;
}

export interface TermRange {
  min: LoanTerm;
  max: LoanTerm;
}

// Conversion constants
const SECONDS_PER_DAY = 86400;
const DAYS_PER_WEEK = 7;
const DAYS_PER_MONTH = 30;
const DAYS_PER_YEAR = 365;

/**
 * Convert term to days
 */
export function termToDays(value: number, unit: TermUnit): number {
  switch (unit) {
    case 'days':
      return value;
    case 'weeks':
      return value * DAYS_PER_WEEK;
    case 'months':
      return value * DAYS_PER_MONTH;
    case 'years':
      return value * DAYS_PER_YEAR;
    default:
      return value;
  }
}

/**
 * Convert term to seconds
 */
export function termToSeconds(value: number, unit: TermUnit): number {
  return termToDays(value, unit) * SECONDS_PER_DAY;
}

/**
 * Convert days to best unit
 */
export function daysToTerm(totalDays: number): LoanTerm {
  let value: number;
  let unit: TermUnit;

  if (totalDays >= DAYS_PER_YEAR) {
    value = Math.round((totalDays / DAYS_PER_YEAR) * 10) / 10;
    unit = 'years';
  } else if (totalDays >= DAYS_PER_MONTH) {
    value = Math.round((totalDays / DAYS_PER_MONTH) * 10) / 10;
    unit = 'months';
  } else if (totalDays >= DAYS_PER_WEEK) {
    value = Math.round((totalDays / DAYS_PER_WEEK) * 10) / 10;
    unit = 'weeks';
  } else {
    value = totalDays;
    unit = 'days';
  }

  return {
    value,
    unit,
    totalDays,
    totalSeconds: totalDays * SECONDS_PER_DAY,
  };
}

/**
 * Convert seconds to term
 */
export function secondsToTerm(totalSeconds: number): LoanTerm {
  const totalDays = Math.floor(totalSeconds / SECONDS_PER_DAY);
  return daysToTerm(totalDays);
}

/**
 * Create loan term object
 */
export function createTerm(value: number, unit: TermUnit): LoanTerm {
  const totalDays = termToDays(value, unit);
  return {
    value,
    unit,
    totalDays,
    totalSeconds: totalDays * SECONDS_PER_DAY,
  };
}

/**
 * Add terms together
 */
export function addTerms(term1: LoanTerm, term2: LoanTerm): LoanTerm {
  const totalDays = term1.totalDays + term2.totalDays;
  return daysToTerm(totalDays);
}

/**
 * Subtract terms
 */
export function subtractTerms(term1: LoanTerm, term2: LoanTerm): LoanTerm {
  const totalDays = Math.max(0, term1.totalDays - term2.totalDays);
  return daysToTerm(totalDays);
}

/**
 * Compare two terms
 */
export function compareTerms(term1: LoanTerm, term2: LoanTerm): number {
  return term1.totalDays - term2.totalDays;
}

/**
 * Check if term is within range
 */
export function isTermInRange(term: LoanTerm, range: TermRange): boolean {
  return term.totalDays >= range.min.totalDays && term.totalDays <= range.max.totalDays;
}

/**
 * Calculate remaining term
 */
export function calculateRemainingTerm(
  startTimestamp: number,
  durationSeconds: number,
  currentTimestamp?: number
): LoanTerm {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const endTimestamp = startTimestamp + durationSeconds;
  const remainingSeconds = Math.max(0, endTimestamp - now);
  return secondsToTerm(remainingSeconds);
}

/**
 * Calculate elapsed term
 */
export function calculateElapsedTerm(
  startTimestamp: number,
  currentTimestamp?: number
): LoanTerm {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const elapsedSeconds = Math.max(0, now - startTimestamp);
  return secondsToTerm(elapsedSeconds);
}

/**
 * Calculate term progress percentage
 */
export function calculateTermProgress(
  startTimestamp: number,
  durationSeconds: number,
  currentTimestamp?: number
): number {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const elapsed = now - startTimestamp;
  const progress = Math.min(100, Math.max(0, (elapsed / durationSeconds) * 100));
  return Math.round(progress * 100) / 100;
}

/**
 * Get due date from start and duration
 */
export function getDueDate(startTimestamp: number, durationSeconds: number): Date {
  return new Date((startTimestamp + durationSeconds) * 1000);
}

/**
 * Check if term is expired
 */
export function isTermExpired(
  startTimestamp: number,
  durationSeconds: number,
  currentTimestamp?: number
): boolean {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  return now >= startTimestamp + durationSeconds;
}

/**
 * Calculate days until due
 */
export function daysUntilDue(
  startTimestamp: number,
  durationSeconds: number,
  currentTimestamp?: number
): number {
  const remaining = calculateRemainingTerm(startTimestamp, durationSeconds, currentTimestamp);
  return remaining.totalDays;
}

/**
 * Calculate days overdue
 */
export function daysOverdue(
  startTimestamp: number,
  durationSeconds: number,
  currentTimestamp?: number
): number {
  const now = currentTimestamp || Math.floor(Date.now() / 1000);
  const dueTimestamp = startTimestamp + durationSeconds;
  const overdueSeconds = Math.max(0, now - dueTimestamp);
  return Math.floor(overdueSeconds / SECONDS_PER_DAY);
}

/**
 * Format term for display
 */
export function formatTerm(term: LoanTerm): string {
  const unitLabels: Record<TermUnit, { singular: string; plural: string }> = {
    days: { singular: 'day', plural: 'days' },
    weeks: { singular: 'week', plural: 'weeks' },
    months: { singular: 'month', plural: 'months' },
    years: { singular: 'year', plural: 'years' },
  };

  const label = term.value === 1 
    ? unitLabels[term.unit].singular 
    : unitLabels[term.unit].plural;

  return `${term.value} ${label}`;
}

/**
 * Format term short
 */
export function formatTermShort(term: LoanTerm): string {
  const unitShort: Record<TermUnit, string> = {
    days: 'd',
    weeks: 'w',
    months: 'mo',
    years: 'y',
  };
  return `${term.value}${unitShort[term.unit]}`;
}

/**
 * Get standard term options
 */
export function getStandardTermOptions(): LoanTerm[] {
  return [
    createTerm(7, 'days'),
    createTerm(14, 'days'),
    createTerm(30, 'days'),
    createTerm(60, 'days'),
    createTerm(90, 'days'),
    createTerm(6, 'months'),
    createTerm(1, 'years'),
  ];
}

export { SECONDS_PER_DAY, DAYS_PER_WEEK, DAYS_PER_MONTH, DAYS_PER_YEAR };

