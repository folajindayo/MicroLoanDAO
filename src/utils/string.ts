/**
 * String manipulation utilities
 */

/**
 * Truncates a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number, suffix = '...'): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter of each word
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Converts a string to camelCase
 */
export function toCamelCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Converts a string to kebab-case
 */
export function toKebabCase(str: string): string {
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Removes extra whitespace from a string
 */
export function normalizeWhitespace(str: string): string {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a string is empty or only whitespace
 */
export function isBlank(str: string | undefined | null): boolean {
  return !str || str.trim() === '';
}

/**
 * Checks if a string is not empty and not just whitespace
 */
export function isNotBlank(str: string | undefined | null): str is string {
  return !isBlank(str);
}

/**
 * Escapes HTML entities in a string
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Generates a slug from a string
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pluralizes a word based on count
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural || `${word}s`;
}

/**
 * Gets initials from a name
 */
export function getInitials(name: string, maxInitials = 2): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, maxInitials)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

/**
 * Checks if a string contains another string (case-insensitive)
 */
export function containsIgnoreCase(str: string, search: string): boolean {
  if (!str || !search) return false;
  return str.toLowerCase().includes(search.toLowerCase());
}

/**
 * Generates a random string of specified length
 */
export function randomString(length: number, charset = 'alphanumeric'): string {
  const charsets: Record<string, string> = {
    alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789',
    hex: '0123456789abcdef',
  };
  
  const chars = charsets[charset] || charset;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Formats a loan purpose for display
 */
export function formatLoanPurpose(purpose: string, maxLength = 50): string {
  const trimmed = normalizeWhitespace(purpose);
  return truncate(trimmed, maxLength);
}

/**
 * Extracts mentions from a string (@username)
 */
export function extractMentions(str: string): string[] {
  const matches = str.match(/@[\w]+/g);
  return matches ? matches.map(m => m.slice(1)) : [];
}

export default {
  truncate,
  capitalize,
  titleCase,
  toCamelCase,
  toKebabCase,
  normalizeWhitespace,
  isBlank,
  isNotBlank,
  escapeHtml,
  slugify,
  pluralize,
  getInitials,
  containsIgnoreCase,
  randomString,
  formatLoanPurpose,
  extractMentions,
};

