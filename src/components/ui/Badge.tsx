import React from 'react';
import { LoanStatus, LOAN_STATUS_LABELS } from '@/constants/contracts';

/**
 * Badge variant types
 */
type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Badge size types
 */
type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Badge component
 */
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Variant style classes
 */
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  secondary: 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

/**
 * Size style classes
 */
const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * A badge component for displaying status, labels, or counts.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pill = false,
  icon,
  className = '',
}) => {
  const classes = [
    'inline-flex items-center font-medium',
    pill ? 'rounded-full' : 'rounded-md',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {icon && <span className="mr-1 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

/**
 * Loan status badge component
 */
export const LoanStatusBadge: React.FC<{
  status: LoanStatus;
  size?: BadgeSize;
  className?: string;
}> = ({ status, size = 'md', className = '' }) => {
  const statusVariants: Record<LoanStatus, BadgeVariant> = {
    [LoanStatus.REQUESTED]: 'warning',
    [LoanStatus.FUNDED]: 'info',
    [LoanStatus.REPAID]: 'success',
    [LoanStatus.DEFAULTED]: 'danger',
  };

  return (
    <Badge variant={statusVariants[status]} size={size} pill className={className}>
      {LOAN_STATUS_LABELS[status]}
    </Badge>
  );
};

/**
 * Counter badge for notifications
 */
export const CounterBadge: React.FC<{
  count: number;
  max?: number;
  className?: string;
}> = ({ count, max = 99, className = '' }) => {
  if (count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge variant="danger" size="sm" pill className={`min-w-[1.25rem] justify-center ${className}`}>
      {displayCount}
    </Badge>
  );
};

/**
 * Dot indicator badge
 */
export const DotBadge: React.FC<{
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue';
  label?: string;
  className?: string;
}> = ({ color = 'gray', label, className = '' }) => {
  const dotColors: Record<string, string> = {
    gray: 'bg-gray-400',
    green: 'bg-green-400',
    yellow: 'bg-yellow-400',
    red: 'bg-red-400',
    blue: 'bg-blue-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`h-2 w-2 rounded-full ${dotColors[color]}`} />
      {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
    </span>
  );
};

export default Badge;

