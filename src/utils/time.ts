/**
 * Time calculation and formatting utilities
 */

/**
 * Time constants in milliseconds
 */
export const TIME_MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

/**
 * Time constants in seconds
 */
export const TIME_SECONDS = {
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000,
} as const;

/**
 * Converts Unix timestamp (seconds) to Date
 */
export function fromUnixTime(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * Converts Date to Unix timestamp (seconds)
 */
export function toUnixTime(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Gets the current Unix timestamp in seconds
 */
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Formats duration in seconds to human-readable string
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const days = Math.floor(seconds / TIME_SECONDS.DAY);
  const hours = Math.floor((seconds % TIME_SECONDS.DAY) / TIME_SECONDS.HOUR);
  const minutes = Math.floor((seconds % TIME_SECONDS.HOUR) / TIME_SECONDS.MINUTE);
  const secs = Math.floor(seconds % TIME_SECONDS.MINUTE);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}

/**
 * Formats duration in a long readable format
 */
export function formatDurationLong(seconds: number): string {
  if (seconds < 0) return '0 seconds';
  
  const days = Math.floor(seconds / TIME_SECONDS.DAY);
  const hours = Math.floor((seconds % TIME_SECONDS.DAY) / TIME_SECONDS.HOUR);
  const minutes = Math.floor((seconds % TIME_SECONDS.HOUR) / TIME_SECONDS.MINUTE);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  
  return parts.join(', ');
}

/**
 * Returns a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const diffMs = Date.now() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  
  return dateObj.toLocaleDateString();
}

/**
 * Returns countdown format (e.g., "2d 5h 30m")
 */
export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const days = Math.floor(seconds / TIME_SECONDS.DAY);
  const hours = Math.floor((seconds % TIME_SECONDS.DAY) / TIME_SECONDS.HOUR);
  const minutes = Math.floor((seconds % TIME_SECONDS.HOUR) / TIME_SECONDS.MINUTE);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Formats a date in standard format
 */
export function formatDate(date: Date | number | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date with time
 */
export function formatDateTime(date: Date | number | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Checks if a date is today
 */
export function isToday(date: Date | number): boolean {
  const dateObj = date instanceof Date ? date : new Date(date);
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Checks if a timestamp is in the past
 */
export function isPast(timestamp: number): boolean {
  return timestamp < now();
}

/**
 * Checks if a timestamp is in the future
 */
export function isFuture(timestamp: number): boolean {
  return timestamp > now();
}

/**
 * Adds days to a timestamp
 */
export function addDays(timestamp: number, days: number): number {
  return timestamp + days * TIME_SECONDS.DAY;
}

/**
 * Gets the start of day (midnight) for a date
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Gets the difference in days between two timestamps
 */
export function daysBetween(timestamp1: number, timestamp2: number): number {
  return Math.floor(Math.abs(timestamp2 - timestamp1) / TIME_SECONDS.DAY);
}

/**
 * Parses a duration string (e.g., "7d", "24h", "30m") to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)(s|m|h|d|w)$/);
  if (!match) return 0;
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  const multipliers: Record<string, number> = {
    s: 1,
    m: TIME_SECONDS.MINUTE,
    h: TIME_SECONDS.HOUR,
    d: TIME_SECONDS.DAY,
    w: TIME_SECONDS.WEEK,
  };
  
  return value * (multipliers[unit] || 1);
}

export default {
  TIME_MS,
  TIME_SECONDS,
  fromUnixTime,
  toUnixTime,
  now,
  formatDuration,
  formatDurationLong,
  formatRelativeTime,
  formatCountdown,
  formatDate,
  formatDateTime,
  isToday,
  isPast,
  isFuture,
  addDays,
  startOfDay,
  daysBetween,
  parseDuration,
};

