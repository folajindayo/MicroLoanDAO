/**
 * Object manipulation utilities
 */

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * Checks if a value is a plain object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Picks specified keys from an object
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omits specified keys from an object
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

/**
 * Maps object values with a function
 */
export function mapValues<T, R>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => R
): Record<string, R> {
  const result: Record<string, R> = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[key] = fn(value, key);
  });
  return result;
}

/**
 * Filters object entries by a predicate
 */
export function filterObject<T>(
  obj: Record<string, T>,
  predicate: (value: T, key: string) => boolean
): Record<string, T> {
  const result: Record<string, T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(value, key)) {
      result[key] = value;
    }
  });
  return result;
}

/**
 * Gets a nested value from an object using a path
 */
export function get<T>(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return defaultValue;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return (current as T) ?? defaultValue;
}

/**
 * Checks if an object has a property
 */
export function has(obj: Record<string, unknown>, path: string): boolean {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return false;
    }
    if (!Object.prototype.hasOwnProperty.call(current, key)) {
      return false;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return true;
}

/**
 * Removes undefined and null values from an object
 */
export function compact<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      result[key as keyof T] = value as T[keyof T];
    }
  });
  return result;
}

/**
 * Checks if two objects are deeply equal
 */
export function isEqual(obj1: unknown, obj2: unknown): boolean {
  if (obj1 === obj2) return true;
  
  if (typeof obj1 !== typeof obj2) return false;
  if (obj1 === null || obj2 === null) return false;
  
  if (typeof obj1 !== 'object') return false;
  
  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!isEqual(
      (obj1 as Record<string, unknown>)[key],
      (obj2 as Record<string, unknown>)[key]
    )) {
      return false;
    }
  }
  
  return true;
}

/**
 * Merges two objects shallowly
 */
export function merge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  return { ...target, ...source };
}

/**
 * Checks if an object is empty
 */
export function isEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Creates an object from key-value pairs
 */
export function fromEntries<T>(entries: [string, T][]): Record<string, T> {
  return Object.fromEntries(entries) as Record<string, T>;
}

export default {
  deepClone,
  isObject,
  pick,
  omit,
  mapValues,
  filterObject,
  get,
  has,
  compact,
  isEqual,
  merge,
  isEmpty,
  fromEntries,
};

