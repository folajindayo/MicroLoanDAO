/**
 * Duration and Time Period Utilities
 * Functions for time period calculations and formatting
 */

export interface Duration {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

// Time constants in seconds
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;
const SECONDS_PER_MONTH = 2592000; // 30 days
const SECONDS_PER_YEAR = 31536000; // 365 days

/**
 * Parse seconds into duration components
 */
export function parseDuration(totalSeconds: number): Duration {
  let remaining = Math.abs(totalSeconds);

  const years = Math.floor(remaining / SECONDS_PER_YEAR);
  remaining %= SECONDS_PER_YEAR;

  const months = Math.floor(remaining / SECONDS_PER_MONTH);
  remaining %= SECONDS_PER_MONTH;

  const weeks = Math.floor(remaining / SECONDS_PER_WEEK);
  remaining %= SECONDS_PER_WEEK;

  const days = Math.floor(remaining / SECONDS_PER_DAY);
  remaining %= SECONDS_PER_DAY;

  const hours = Math.floor(remaining / SECONDS_PER_HOUR);
  remaining %= SECONDS_PER_HOUR;

  const minutes = Math.floor(remaining / SECONDS_PER_MINUTE);
  const seconds = remaining % SECONDS_PER_MINUTE;

  return {
    years,
    months,
    weeks,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}

/**
 * Create duration from components
 */
export function createDuration(params: Partial<Omit<Duration, 'totalSeconds'>>): Duration {
  const totalSeconds =
    (params.years || 0) * SECONDS_PER_YEAR +
    (params.months || 0) * SECONDS_PER_MONTH +
    (params.weeks || 0) * SECONDS_PER_WEEK +
    (params.days || 0) * SECONDS_PER_DAY +
    (params.hours || 0) * SECONDS_PER_HOUR +
    (params.minutes || 0) * SECONDS_PER_MINUTE +
    (params.seconds || 0);

  return parseDuration(totalSeconds);
}

/**
 * Format duration as human readable string
 */
export function formatDuration(duration: Duration, options?: { short?: boolean; maxUnits?: number }): string {
  const { short = false, maxUnits = 2 } = options || {};
  const parts: string[] = [];

  const units: Array<{ value: number; singular: string; plural: string; short: string }> = [
    { value: duration.years, singular: 'year', plural: 'years', short: 'y' },
    { value: duration.months, singular: 'month', plural: 'months', short: 'mo' },
    { value: duration.weeks, singular: 'week', plural: 'weeks', short: 'w' },
    { value: duration.days, singular: 'day', plural: 'days', short: 'd' },
    { value: duration.hours, singular: 'hour', plural: 'hours', short: 'h' },
    { value: duration.minutes, singular: 'minute', plural: 'minutes', short: 'm' },
    { value: duration.seconds, singular: 'second', plural: 'seconds', short: 's' },
  ];

  for (const unit of units) {
    if (unit.value > 0 && parts.length < maxUnits) {
      if (short) {
        parts.push(`${unit.value}${unit.short}`);
      } else {
        parts.push(`${unit.value} ${unit.value === 1 ? unit.singular : unit.plural}`);
      }
    }
  }

  return parts.length > 0 ? parts.join(short ? ' ' : ', ') : short ? '0s' : '0 seconds';
}

/**
 * Format duration from seconds
 */
export function formatDurationFromSeconds(seconds: number, options?: { short?: boolean; maxUnits?: number }): string {
  return formatDuration(parseDuration(seconds), options);
}

/**
 * Get time until date
 */
export function getTimeUntil(targetDate: Date, fromDate: Date = new Date()): Duration {
  const diffMs = targetDate.getTime() - fromDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  return parseDuration(diffSeconds);
}

/**
 * Get time since date
 */
export function getTimeSince(pastDate: Date, fromDate: Date = new Date()): Duration {
  const diffMs = fromDate.getTime() - pastDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  return parseDuration(diffSeconds);
}

/**
 * Format relative time
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const isPast = diffMs > 0;
  const diffSeconds = Math.abs(Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return isPast ? 'just now' : 'in a moment';
  }

  const duration = parseDuration(diffSeconds);
  const formatted = formatDuration(duration, { maxUnits: 1 });

  return isPast ? `${formatted} ago` : `in ${formatted}`;
}

/**
 * Add duration to date
 */
export function addDuration(date: Date, duration: Duration): Date {
  return new Date(date.getTime() + duration.totalSeconds * 1000);
}

/**
 * Subtract duration from date
 */
export function subtractDuration(date: Date, duration: Duration): Date {
  return new Date(date.getTime() - duration.totalSeconds * 1000);
}

/**
 * Compare two durations
 */
export function compareDurations(d1: Duration, d2: Duration): number {
  return d1.totalSeconds - d2.totalSeconds;
}

/**
 * Check if duration is zero
 */
export function isZeroDuration(duration: Duration): boolean {
  return duration.totalSeconds === 0;
}

/**
 * Get duration percentage of total
 */
export function getDurationPercentage(elapsed: Duration, total: Duration): number {
  if (total.totalSeconds === 0) return 100;
  const percentage = (elapsed.totalSeconds / total.totalSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(percentage * 100) / 100));
}

/**
 * Convert days to duration
 */
export function daysToSeconds(days: number): number {
  return days * SECONDS_PER_DAY;
}

/**
 * Convert duration to days
 */
export function secondsToDays(seconds: number): number {
  return seconds / SECONDS_PER_DAY;
}

/**
 * Get countdown string
 */
export function getCountdown(targetDate: Date, now: Date = new Date()): string {
  if (targetDate <= now) return 'Expired';
  
  const duration = getTimeUntil(targetDate, now);
  return formatDuration(duration, { maxUnits: 2 });
}

export {
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  SECONDS_PER_DAY,
  SECONDS_PER_WEEK,
  SECONDS_PER_MONTH,
  SECONDS_PER_YEAR,
};

