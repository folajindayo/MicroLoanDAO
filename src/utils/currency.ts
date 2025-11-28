/**
 * Currency formatting utilities
 */

import { formatEther, formatUnits } from 'viem';

/**
 * Formats ETH value with symbol
 */
export function formatEth(
  value: bigint | string | undefined,
  decimals = 4
): string {
  if (!value) return '0 ETH';
  const wei = typeof value === 'string' ? BigInt(value) : value;
  const eth = parseFloat(formatEther(wei)).toFixed(decimals);
  return `${eth} ETH`;
}

/**
 * Formats ETH value without symbol
 */
export function formatEthAmount(
  value: bigint | string | undefined,
  decimals = 4
): string {
  if (!value) return '0';
  const wei = typeof value === 'string' ? BigInt(value) : value;
  return parseFloat(formatEther(wei)).toFixed(decimals);
}

/**
 * Formats USD value
 */
export function formatUsd(
  value: number,
  decimals = 2
): string {
  if (isNaN(value)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats a generic currency value
 */
export function formatCurrency(
  value: number,
  currency = 'USD',
  decimals = 2
): string {
  if (isNaN(value)) return `${currency} 0.00`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formats token value with symbol
 */
export function formatToken(
  value: bigint | string | undefined,
  symbol: string,
  tokenDecimals = 18,
  displayDecimals = 4
): string {
  if (!value) return `0 ${symbol}`;
  const raw = typeof value === 'string' ? BigInt(value) : value;
  const formatted = parseFloat(formatUnits(raw, tokenDecimals)).toFixed(displayDecimals);
  return `${formatted} ${symbol}`;
}

/**
 * Formats a number with commas and optional decimals
 */
export function formatNumber(
  value: number | string,
  decimals?: number
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  const options: Intl.NumberFormatOptions = decimals !== undefined
    ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
    : {};
  
  return num.toLocaleString('en-US', options);
}

/**
 * Formats a number in compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompact(value: number): string {
  if (isNaN(value)) return '0';
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formats ETH with USD equivalent
 */
export function formatEthWithUsd(
  ethValue: bigint | string | undefined,
  ethToUsd: number,
  ethDecimals = 4,
  usdDecimals = 2
): string {
  if (!ethValue) return '0 ETH';
  
  const wei = typeof ethValue === 'string' ? BigInt(ethValue) : ethValue;
  const eth = parseFloat(formatEther(wei));
  const usd = eth * ethToUsd;
  
  return `${eth.toFixed(ethDecimals)} ETH (${formatUsd(usd, usdDecimals)})`;
}

/**
 * Converts ETH to USD
 */
export function ethToUsd(ethAmount: number, ethPrice: number): number {
  return ethAmount * ethPrice;
}

/**
 * Converts USD to ETH
 */
export function usdToEth(usdAmount: number, ethPrice: number): number {
  if (ethPrice === 0) return 0;
  return usdAmount / ethPrice;
}

/**
 * Formats gas price in Gwei
 */
export function formatGwei(gwei: number | bigint): string {
  const value = typeof gwei === 'bigint' ? Number(gwei) : gwei;
  return `${value.toFixed(2)} Gwei`;
}

/**
 * Formats a percentage
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats interest rate from basis points
 */
export function formatInterestRate(bps: number): string {
  const percentage = bps / 100;
  return formatPercentage(percentage);
}

/**
 * Parses a currency string to number
 */
export function parseCurrencyString(str: string): number {
  // Remove currency symbols, commas, and whitespace
  const cleaned = str.replace(/[$,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Formats a range of values (e.g., "$100 - $500")
 */
export function formatRange(
  min: number,
  max: number,
  formatter: (value: number) => string = formatUsd
): string {
  return `${formatter(min)} - ${formatter(max)}`;
}

export default {
  formatEth,
  formatEthAmount,
  formatUsd,
  formatCurrency,
  formatToken,
  formatNumber,
  formatCompact,
  formatEthWithUsd,
  ethToUsd,
  usdToEth,
  formatGwei,
  formatPercentage,
  formatInterestRate,
  parseCurrencyString,
  formatRange,
};

