/**
 * LocalStorage wrapper utilities with error handling
 */

const PREFIX = 'microloan_dao_';

/**
 * Gets the prefixed key
 */
function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

/**
 * Checks if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets an item from localStorage with type safety
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) return defaultValue;
  
  try {
    const item = localStorage.getItem(getKey(key));
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Sets an item in localStorage
 */
export function setItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/**
 * Removes an item from localStorage
 */
export function removeItem(key: string): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(getKey(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears all items with our prefix from localStorage
 */
export function clearAll(): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets all keys with our prefix
 */
export function getAllKeys(): string[] {
  if (!isStorageAvailable()) return [];
  
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keys.push(key.slice(PREFIX.length));
    }
  }
  return keys;
}

/**
 * Storage item with expiration
 */
interface ExpirableItem<T> {
  value: T;
  expiry: number;
}

/**
 * Sets an item with expiration time
 */
export function setItemWithExpiry<T>(key: string, value: T, ttlMs: number): boolean {
  const item: ExpirableItem<T> = {
    value,
    expiry: Date.now() + ttlMs,
  };
  return setItem(key, item);
}

/**
 * Gets an item with expiration check
 */
export function getItemWithExpiry<T>(key: string, defaultValue: T): T {
  const item = getItem<ExpirableItem<T> | null>(key, null);
  
  if (!item) return defaultValue;
  
  if (Date.now() > item.expiry) {
    removeItem(key);
    return defaultValue;
  }
  
  return item.value;
}

/**
 * Storage keys for the application
 */
export const STORAGE_KEYS = {
  WALLET_CONNECTED: 'wallet_connected',
  LAST_WALLET: 'last_wallet',
  THEME: 'theme',
  LOAN_DRAFTS: 'loan_drafts',
  PREFERENCES: 'preferences',
  RECENTLY_VIEWED: 'recently_viewed',
} as const;

/**
 * Saves a loan draft
 */
export function saveLoanDraft(draft: {
  amount: string;
  purpose: string;
  duration: string;
  interestRate: string;
}): boolean {
  return setItem(STORAGE_KEYS.LOAN_DRAFTS, draft);
}

/**
 * Gets the saved loan draft
 */
export function getLoanDraft(): {
  amount: string;
  purpose: string;
  duration: string;
  interestRate: string;
} | null {
  return getItem(STORAGE_KEYS.LOAN_DRAFTS, null);
}

/**
 * Clears the loan draft
 */
export function clearLoanDraft(): boolean {
  return removeItem(STORAGE_KEYS.LOAN_DRAFTS);
}

export default {
  isStorageAvailable,
  getItem,
  setItem,
  removeItem,
  clearAll,
  getAllKeys,
  setItemWithExpiry,
  getItemWithExpiry,
  STORAGE_KEYS,
  saveLoanDraft,
  getLoanDraft,
  clearLoanDraft,
};

