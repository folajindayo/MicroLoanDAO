import React from 'react';

/**
 * Spinner size types
 */
type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Spinner variant types
 */
type SpinnerVariant = 'default' | 'primary' | 'white';

/**
 * Props for the Spinner component
 */
interface SpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses: Record<SpinnerVariant, { track: string; spinner: string }> = {
  default: { track: 'text-gray-200 dark:text-gray-700', spinner: 'text-gray-600 dark:text-gray-400' },
  primary: { track: 'text-indigo-200 dark:text-indigo-900', spinner: 'text-indigo-600 dark:text-indigo-400' },
  white: { track: 'text-white/30', spinner: 'text-white' },
};

/**
 * Spinner loading component
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  label = 'Loading...',
  className = '',
}) => {
  const colors = variantClasses[variant];

  return (
    <div role="status" aria-label={label} className={`inline-flex items-center justify-center ${className}`}>
      <svg className={`animate-spin ${sizeClasses[size]}`} viewBox="0 0 24 24" fill="none">
        <circle className={colors.track} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className={colors.spinner} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
};

/**
 * Full-page loading spinner
 */
export const PageSpinner: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="xl" variant="primary" label={label} />
      <p className="text-gray-600 dark:text-gray-400 font-medium">{label}</p>
    </div>
  </div>
);

/**
 * Inline loading spinner with text
 */
export const InlineSpinner: React.FC<{ text?: string; size?: SpinnerSize; className?: string }> = ({
  text,
  size = 'sm',
  className = '',
}) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <Spinner size={size} />
    {text && <span className="text-gray-600 dark:text-gray-400">{text}</span>}
  </span>
);

/**
 * Button spinner (smaller, white)
 */
export const ButtonSpinner: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Spinner size="sm" variant="white" className={className} />
);

export default Spinner;

