import React from 'react';

type ProgressSize = 'sm' | 'md' | 'lg';
type ProgressVariant = 'default' | 'success' | 'warning' | 'danger';

interface ProgressProps {
  value: number;
  max?: number;
  size?: ProgressSize;
  variant?: ProgressVariant;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeClasses: Record<ProgressSize, string> = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-4',
};

const variantClasses: Record<ProgressVariant, string> = {
  default: 'bg-indigo-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

/**
 * Progress bar component
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const displayLabel = label ?? `${Math.round(percentage)}%`;

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{displayLabel}</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${variantClasses[variant]} ${animated ? 'animate-pulse' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

/**
 * Circular progress indicator
 */
export const CircularProgress: React.FC<{
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: ProgressVariant;
  showLabel?: boolean;
  className?: string;
}> = ({ value, max = 100, size = 48, strokeWidth = 4, variant = 'default', showLabel = true, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColors: Record<ProgressVariant, string> = {
    default: 'stroke-indigo-600',
    success: 'stroke-green-500',
    warning: 'stroke-yellow-500',
    danger: 'stroke-red-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-gray-200 dark:text-gray-700" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`transition-all duration-300 ${strokeColors[variant]}`} />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

/**
 * Loan repayment progress
 */
export const LoanProgress: React.FC<{
  repaid: bigint;
  total: bigint;
  className?: string;
}> = ({ repaid, total, className = '' }) => {
  const percentage = total > 0n ? Number((repaid * 100n) / total) : 0;
  
  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">Repaid</span>
        <span className="font-medium text-gray-900 dark:text-white">{percentage}%</span>
      </div>
      <Progress value={percentage} variant={percentage >= 100 ? 'success' : 'default'} />
    </div>
  );
};

export default Progress;

