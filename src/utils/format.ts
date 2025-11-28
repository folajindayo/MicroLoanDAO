/**
 * Format Utilities
 * 
 * Formatting functions for numbers, currencies, addresses, and other data types.
 */

/**
 * Format a number with commas and decimal places
 */
export function formatNumber(
  value: number | bigint,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  const num = typeof value === 'bigint' ? Number(value) : value;
  return num.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format Wei to Ether with specified decimal places
 */
export function formatWei(wei: bigint, decimals: number = 4): string {
  const ether = Number(wei) / 1e18;
  
  if (ether === 0) return '0';
  if (ether < 0.0001) return '< 0.0001';
  
  return formatNumber(ether, decimals);
}

/**
 * Format Ether with ETH suffix
 */
export function formatEther(wei: bigint, decimals: number = 4): string {
  return `${formatWei(wei, decimals)} ETH`;
}

/**
 * Parse Ether string to Wei bigint
 */
export function parseEther(ether: string): bigint {
  const etherFloat = parseFloat(ether);
  if (isNaN(etherFloat)) {
    throw new Error('Invalid ether amount');
  }
  return BigInt(Math.floor(etherFloat * 1e18));
}

/**
 * Format an Ethereum address with truncation
 */
export function formatAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format a transaction hash with truncation
 */
export function formatTxHash(hash: string, chars: number = 8): string {
  if (!hash) return '';
  return formatAddress(hash, chars, chars);
}

/**
 * Format percentage (basis points to percent)
 */
export function formatBasisPoints(basisPoints: number | bigint, decimals: number = 2): string {
  const bp = typeof basisPoints === 'bigint' ? Number(basisPoints) : basisPoints;
  return `${(bp / 100).toFixed(decimals)}%`;
}

/**
 * Format percentage from decimal
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format currency with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format compact number (1K, 1M, etc.)
 */
export function formatCompact(value: number | bigint, locale: string = 'en-US'): string {
  const num = typeof value === 'bigint' ? Number(value) : value;
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Format duration in seconds to human readable
 */
export function formatDuration(seconds: number | bigint): string {
  const secs = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  
  if (secs < 60) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }
  
  if (secs < 3600) {
    const minutes = Math.floor(secs / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  if (secs < 86400) {
    const hours = Math.floor(secs / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  const days = Math.floor(secs / 86400);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Format duration in days
 */
export function formatDurationDays(seconds: number | bigint): string {
  const secs = typeof seconds === 'bigint' ? Number(seconds) : seconds;
  const days = Math.ceil(secs / 86400);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Expired';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number | Date): string {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  
  if (diffSecs < 60) return 'just now';
  if (diffSecs < 3600) {
    const mins = Math.floor(diffSecs / 60);
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  }
  if (diffSecs < 86400) {
    const hours = Math.floor(diffSecs / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  if (diffSecs < 604800) {
    const days = Math.floor(diffSecs / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  return date.toLocaleDateString();
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Format date to locale string
 */
export function formatDate(
  date: Date | number,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date;
  return d.toLocaleDateString(locale, options || {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: Date | number,
  locale: string = 'en-US'
): string {
  const d = typeof date === 'number' ? new Date(date * 1000) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

