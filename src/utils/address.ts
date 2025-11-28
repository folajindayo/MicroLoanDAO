/**
 * Address formatting and validation utilities for MicroLoan
 */

import { getAddress, isAddress } from 'viem';

/**
 * Checks if a string is a valid Ethereum address
 */
export function isValidAddress(address: string | undefined | null): address is `0x${string}` {
  if (!address) return false;
  return isAddress(address);
}

/**
 * Returns checksummed address or null if invalid
 */
export function toChecksumAddress(address: string): `0x${string}` | null {
  try {
    return getAddress(address);
  } catch {
    return null;
  }
}

/**
 * Truncates an address for display (e.g., 0x1234...5678)
 */
export function truncateAddress(
  address: string | undefined | null,
  startChars = 6,
  endChars = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Formats address with optional ENS fallback
 */
export function formatAddress(
  address: string | undefined | null,
  ensName?: string | null
): string {
  if (ensName) return ensName;
  return truncateAddress(address);
}

/**
 * Compares two addresses case-insensitively
 */
export function addressesEqual(
  address1: string | undefined | null,
  address2: string | undefined | null
): boolean {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
}

/**
 * Returns a CSS color based on address (for avatars)
 */
export function addressToColor(address: string): string {
  if (!address || address.length < 8) return '#6366f1';
  const hash = parseInt(address.slice(2, 8), 16);
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Masks the middle portion of an address
 */
export function maskAddress(
  address: string,
  visibleStart = 6,
  visibleEnd = 4
): string {
  if (!address) return '';
  if (address.length <= visibleStart + visibleEnd) return address;
  const mask = '•'.repeat(4);
  return `${address.slice(0, visibleStart)}${mask}${address.slice(-visibleEnd)}`;
}

/**
 * Zero address constant
 */
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

/**
 * Checks if address is zero address
 */
export function isZeroAddress(address: string | undefined | null): boolean {
  if (!address) return false;
  return address.toLowerCase() === ZERO_ADDRESS.toLowerCase();
}

/**
 * Gets initials from an address for avatar fallback
 */
export function getAddressInitials(address: string): string {
  if (!address || address.length < 4) return '??';
  return address.slice(2, 4).toUpperCase();
}

export default {
  isValidAddress,
  toChecksumAddress,
  truncateAddress,
  formatAddress,
  addressesEqual,
  addressToColor,
  maskAddress,
  isZeroAddress,
  getAddressInitials,
  ZERO_ADDRESS,
};

