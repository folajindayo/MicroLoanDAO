/**
 * Array helper utilities
 */

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];
  
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Removes duplicate values from an array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Removes duplicate objects by a key
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Groups array items by a key function
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Partitions an array based on a predicate
 */
export function partition<T>(
  array: T[],
  predicate: (item: T) => boolean
): [T[], T[]] {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  
  return [truthy, falsy];
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Gets a random element from an array
 */
export function sample<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Returns the first n elements of an array
 */
export function take<T>(array: T[], n: number): T[] {
  return array.slice(0, n);
}

/**
 * Returns the last n elements of an array
 */
export function takeLast<T>(array: T[], n: number): T[] {
  return array.slice(-n);
}

/**
 * Finds an item by id in an array
 */
export function findById<T extends { id: string | number }>(
  array: T[],
  id: string | number
): T | undefined {
  return array.find(item => item.id === id);
}

/**
 * Updates an item in an array by id
 */
export function updateById<T extends { id: string | number }>(
  array: T[],
  id: string | number,
  updates: Partial<T>
): T[] {
  return array.map(item =>
    item.id === id ? { ...item, ...updates } : item
  );
}

/**
 * Removes an item from an array by id
 */
export function removeById<T extends { id: string | number }>(
  array: T[],
  id: string | number
): T[] {
  return array.filter(item => item.id !== id);
}

/**
 * Sorts an array by a key
 */
export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number | Date,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Creates a range of numbers
 */
export function range(start: number, end: number, step = 1): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Checks if an array is empty
 */
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

/**
 * Checks if an array is not empty
 */
export function isNotEmpty<T>(array: T[]): boolean {
  return array.length > 0;
}

/**
 * Gets the last element of an array
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * Gets the first element of an array
 */
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

/**
 * Sums numbers in an array
 */
export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Averages numbers in an array
 */
export function average(array: number[]): number {
  if (array.length === 0) return 0;
  return sum(array) / array.length;
}

/**
 * Counts occurrences of each value
 */
export function countBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, number> {
  return array.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<K, number>);
}

export default {
  chunk,
  unique,
  uniqueBy,
  groupBy,
  partition,
  shuffle,
  sample,
  take,
  takeLast,
  findById,
  updateById,
  removeById,
  sortBy,
  range,
  isEmpty,
  isNotEmpty,
  last,
  first,
  sum,
  average,
  countBy,
};

