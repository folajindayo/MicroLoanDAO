import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Default empty icon
 */
const DefaultIcon: React.FC = () => (
  <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

/**
 * Empty state component for when there's no data
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
    <div className="text-gray-300 dark:text-gray-600 mb-4">
      {icon || <DefaultIcon />}
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
    )}
    {action}
  </div>
);

/**
 * No loans empty state
 */
export const NoLoansEmptyState: React.FC<{
  onCreate?: () => void;
  className?: string;
}> = ({ onCreate, className = '' }) => (
  <EmptyState
    icon={
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    }
    title="No Loans Found"
    description="There are no loans matching your criteria. Create a new loan request to get started."
    action={
      onCreate && (
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Create Loan Request
        </button>
      )
    }
    className={className}
  />
);

/**
 * No results empty state
 */
export const NoResultsEmptyState: React.FC<{
  onClear?: () => void;
  className?: string;
}> = ({ onClear, className = '' }) => (
  <EmptyState
    icon={
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    title="No Results Found"
    description="We couldn't find anything matching your search. Try adjusting your filters."
    action={
      onClear && (
        <button
          onClick={onClear}
          className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Clear Filters
        </button>
      )
    }
    className={className}
  />
);

/**
 * Connect wallet empty state
 */
export const ConnectWalletEmptyState: React.FC<{
  onConnect?: () => void;
  className?: string;
}> = ({ onConnect, className = '' }) => (
  <EmptyState
    icon={
      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    }
    title="Connect Your Wallet"
    description="Please connect your wallet to access the platform features and manage your loans."
    action={
      onConnect && (
        <button
          onClick={onConnect}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Connect Wallet
        </button>
      )
    }
    className={className}
  />
);

export default EmptyState;

