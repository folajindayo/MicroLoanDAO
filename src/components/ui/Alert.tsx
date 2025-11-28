import React from 'react';

/**
 * Alert variant types
 */
type AlertVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Props for the Alert component
 */
interface AlertProps {
  children: React.ReactNode;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

const variantClasses: Record<AlertVariant, { container: string; icon: string; title: string }> = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon: 'text-blue-500',
    title: 'text-blue-800 dark:text-blue-400',
  },
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon: 'text-green-500',
    title: 'text-green-800 dark:text-green-400',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    icon: 'text-yellow-500',
    title: 'text-yellow-800 dark:text-yellow-400',
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: 'text-red-500',
    title: 'text-red-800 dark:text-red-400',
  },
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  success: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
};

/**
 * Alert component for displaying messages
 */
export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  icon,
  className = '',
}) => {
  const styles = variantClasses[variant];
  const displayIcon = icon ?? defaultIcons[variant];

  return (
    <div role="alert" className={`flex items-start gap-3 p-4 border rounded-lg ${styles.container} ${className}`}>
      <span className={`flex-shrink-0 ${styles.icon}`}>{displayIcon}</span>
      <div className="flex-1 min-w-0">
        {title && <h3 className={`font-semibold mb-1 ${styles.title}`}>{title}</h3>}
        <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

/**
 * Inline alert for compact messages
 */
export const InlineAlert: React.FC<{
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'info', children, className = '' }) => {
  const styles = variantClasses[variant];
  return (
    <p className={`flex items-center gap-2 text-sm ${styles.title} ${className}`}>
      <span className="flex-shrink-0">{defaultIcons[variant]}</span>
      {children}
    </p>
  );
};

export default Alert;

