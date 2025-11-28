/**
 * Date Utilities
 * 
 * Date manipulation and calculation functions for loan durations,
 * deadlines, and time-based operations.
 */

/**
 * Time constants in seconds
 */
export const TIME_CONSTANTS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000, // 30 days
  YEAR: 31536000, // 365 days
} as const;

/**
 * Get current Unix timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get current Unix timestamp as bigint
 */
export function getCurrentTimestampBigInt(): bigint {
  return BigInt(getCurrentTimestamp());
}

/**
 * Convert Date to Unix timestamp
 */
export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Convert Unix timestamp to Date
 */
export function timestampToDate(timestamp: number | bigint): Date {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return new Date(ts * 1000);
}

/**
 * Convert days to seconds
 */
export function daysToSeconds(days: number): number {
  return days * TIME_CONSTANTS.DAY;
}

/**
 * Convert seconds to days
 */
export function secondsToDays(seconds: number | bigint): number {
  const secs = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  return Math.floor(secs / TIME_CONSTANTS.DAY);
}

/**
 * Convert hours to seconds
 */
export function hoursToSeconds(hours: number): number {
  return hours * TIME_CONSTANTS.HOUR;
}

/**
 * Convert seconds to hours
 */
export function secondsToHours(seconds: number | bigint): number {
  const secs = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  return Math.floor(secs / TIME_CONSTANTS.HOUR);
}

/**
 * Add duration to a timestamp
 */
export function addDuration(
  timestamp: number | bigint,
  duration: number | bigint
): number {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  const dur = typeof duration === 'bigint' ? Number(duration) : duration;
  return ts + dur;
}

/**
 * Get time until a future timestamp
 */
export function getTimeUntil(futureTimestamp: number | bigint): number {
  const future = typeof futureTimestamp === 'bigint' ? Number(futureTimestamp) : futureTimestamp;
  return Math.max(0, future - getCurrentTimestamp());
}

/**
 * Get time since a past timestamp
 */
export function getTimeSince(pastTimestamp: number | bigint): number {
  const past = typeof pastTimestamp === 'bigint' ? Number(pastTimestamp) : pastTimestamp;
  return Math.max(0, getCurrentTimestamp() - past);
}

/**
 * Check if a timestamp is in the past
 */
export function isPast(timestamp: number | bigint): boolean {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return ts < getCurrentTimestamp();
}

/**
 * Check if a timestamp is in the future
 */
export function isFuture(timestamp: number | bigint): boolean {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  return ts > getCurrentTimestamp();
}

/**
 * Check if a deadline has passed
 */
export function isExpired(startTime: number | bigint, duration: number | bigint): boolean {
  const start = typeof startTime === 'bigint' ? Number(startTime) : startTime;
  const dur = typeof duration === 'bigint' ? Number(duration) : duration;
  return getCurrentTimestamp() > start + dur;
}

/**
 * Get expiry timestamp
 */
export function getExpiryTimestamp(startTime: number | bigint, duration: number | bigint): number {
  const start = typeof startTime === 'bigint' ? Number(startTime) : startTime;
  const dur = typeof duration === 'bigint' ? Number(duration) : duration;
  return start + dur;
}

/**
 * Calculate overdue duration
 */
export function getOverdueDuration(startTime: number | bigint, duration: number | bigint): number {
  const expiry = getExpiryTimestamp(startTime, duration);
  const now = getCurrentTimestamp();
  return Math.max(0, now - expiry);
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(timestamp?: number): number {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get end of day timestamp
 */
export function getEndOfDay(timestamp?: number): number {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  date.setHours(23, 59, 59, 999);
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get start of week timestamp (Monday)
 */
export function getStartOfWeek(timestamp?: number): number {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get start of month timestamp
 */
export function getStartOfMonth(timestamp?: number): number {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

/**
 * Calculate progress percentage
 */
export function calculateTimeProgress(
  startTime: number | bigint,
  duration: number | bigint
): number {
  const start = typeof startTime === 'bigint' ? Number(startTime) : startTime;
  const dur = typeof duration === 'bigint' ? Number(duration) : duration;
  const elapsed = getCurrentTimestamp() - start;
  const progress = (elapsed / dur) * 100;
  return Math.min(100, Math.max(0, progress));
}

/**
 * Format duration breakdown
 */
export interface DurationBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function breakdownDuration(seconds: number | bigint): DurationBreakdown {
  const secs = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  
  return {
    days: Math.floor(secs / TIME_CONSTANTS.DAY),
    hours: Math.floor((secs % TIME_CONSTANTS.DAY) / TIME_CONSTANTS.HOUR),
    minutes: Math.floor((secs % TIME_CONSTANTS.HOUR) / TIME_CONSTANTS.MINUTE),
    seconds: secs % TIME_CONSTANTS.MINUTE,
  };
}

/**
 * Compare two timestamps
 */
export function compareTimestamps(a: number | bigint, b: number | bigint): number {
  const tsA = typeof a === 'bigint' ? Number(a) : a;
  const tsB = typeof b === 'bigint' ? Number(b) : b;
  return tsA - tsB;
}

/**
 * Get the difference between two timestamps
 */
export function getTimeDifference(
  start: number | bigint,
  end: number | bigint
): number {
  const startTs = typeof start === 'bigint' ? Number(start) : start;
  const endTs = typeof end === 'bigint' ? Number(end) : end;
  return Math.abs(endTs - startTs);
}

/**
 * Check if two timestamps are on the same day
 */
export function isSameDay(a: number | bigint, b: number | bigint): boolean {
  const dateA = timestampToDate(a);
  const dateB = timestampToDate(b);
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

/**
 * Get a timestamp from N days ago
 */
export function getDaysAgo(days: number): number {
  return getCurrentTimestamp() - daysToSeconds(days);
}

/**
 * Get a timestamp from N days in the future
 */
export function getDaysFromNow(days: number): number {
  return getCurrentTimestamp() + daysToSeconds(days);
}

