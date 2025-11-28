/**
 * UI Constants
 * 
 * User interface constants including colors, sizes, animations,
 * and other visual configuration values.
 */

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  toast: 800,
  max: 9999,
} as const;

/**
 * Breakpoints (matching Tailwind defaults)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Animation Durations (ms)
 */
export const ANIMATION_DURATION = {
  instant: 0,
  fast: 100,
  normal: 200,
  slow: 300,
  slower: 500,
} as const;

/**
 * Easing Functions
 */
export const EASING = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Toast Configuration
 */
export const TOAST_CONFIG = {
  duration: 5000,
  maxVisible: 5,
  position: 'bottom-right' as const,
} as const;

/**
 * Modal Sizes
 */
export const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
} as const;

/**
 * Button Variants
 */
export const BUTTON_VARIANTS = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
  outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
  ghost: 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
} as const;

/**
 * Button Sizes
 */
export const BUTTON_SIZES = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
} as const;

/**
 * Input Variants
 */
export const INPUT_VARIANTS = {
  default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
  disabled: 'bg-gray-100 cursor-not-allowed opacity-50 dark:bg-gray-800',
} as const;

/**
 * Badge Variants
 */
export const BADGE_VARIANTS = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
} as const;

/**
 * Card Variants
 */
export const CARD_VARIANTS = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  outline: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
  filled: 'bg-gray-50 dark:bg-gray-900',
} as const;

/**
 * Common Spacing Values
 */
export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
} as const;

/**
 * Border Radius Values
 */
export const BORDER_RADIUS = {
  none: '0',
  sm: '0.125rem',
  default: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
} as const;

/**
 * Status Colors (for loan states)
 */
export const STATUS_COLORS = {
  requested: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-800 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  funded: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-800 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  repaid: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  defaulted: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
} as const;

/**
 * Empty State Messages
 */
export const EMPTY_STATES = {
  noLoans: {
    title: 'No Loans Found',
    description: 'There are no loans to display at the moment.',
  },
  noHistory: {
    title: 'No History',
    description: 'Your transaction history will appear here.',
  },
  noResults: {
    title: 'No Results',
    description: 'No items match your search criteria.',
  },
  connectWallet: {
    title: 'Connect Your Wallet',
    description: 'Please connect your wallet to view your loans.',
  },
} as const;

/**
 * Loading Skeleton Configurations
 */
export const SKELETON_CONFIG = {
  loanCard: {
    lines: 4,
    heights: ['h-6', 'h-4', 'h-4', 'h-10'],
  },
  statsCard: {
    lines: 3,
    heights: ['h-4', 'h-8', 'h-4'],
  },
  table: {
    rows: 5,
    columns: 4,
  },
} as const;

/**
 * Form Configuration
 */
export const FORM_CONFIG = {
  debounceMs: 300,
  maxRetries: 3,
  validationDelay: 150,
} as const;

