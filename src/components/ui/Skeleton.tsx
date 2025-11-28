import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  lines?: number;
  className?: string;
}

const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700 rounded';

/**
 * Skeleton loading placeholder
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  lines = 1,
  className = '',
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={`${baseClasses} h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${circle ? 'rounded-full' : ''} ${className}`} style={style} />;
};

/**
 * Skeleton for text content
 */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} height={16} className={i === lines - 1 ? 'w-2/3' : 'w-full'} />
    ))}
  </div>
);

/**
 * Skeleton for avatar
 */
export const SkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 32, md: 40, lg: 48 };
  return <Skeleton circle width={sizes[size]} height={sizes[size]} className={className} />;
};

/**
 * Skeleton for card
 */
export const SkeletonCard: React.FC<{ hasImage?: boolean; className?: string }> = ({ hasImage = true, className = '' }) => (
  <div className={`p-4 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>
    {hasImage && <Skeleton height={160} className="w-full mb-4" />}
    <Skeleton height={24} className="w-3/4 mb-2" />
    <Skeleton height={16} className="w-full mb-1" />
    <Skeleton height={16} className="w-5/6" />
  </div>
);

/**
 * Skeleton for loan card
 */
export const SkeletonLoanCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`p-6 border border-gray-200 dark:border-gray-700 rounded-xl ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="md" />
        <div>
          <Skeleton height={20} width={120} className="mb-1" />
          <Skeleton height={14} width={80} />
        </div>
      </div>
      <Skeleton height={24} width={80} />
    </div>
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton height={16} width={60} />
        <Skeleton height={16} width={100} />
      </div>
      <div className="flex justify-between">
        <Skeleton height={16} width={80} />
        <Skeleton height={16} width={60} />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
      <Skeleton height={40} className="flex-1" />
      <Skeleton height={40} width={100} />
    </div>
  </div>
);

/**
 * Skeleton for list item
 */
export const SkeletonListItem: React.FC<{ hasAvatar?: boolean; className?: string }> = ({ hasAvatar = true, className = '' }) => (
  <div className={`flex items-center gap-4 p-4 ${className}`}>
    {hasAvatar && <SkeletonAvatar />}
    <div className="flex-1">
      <Skeleton height={16} className="w-1/3 mb-2" />
      <Skeleton height={14} className="w-2/3" />
    </div>
  </div>
);

export default Skeleton;

