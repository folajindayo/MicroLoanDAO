import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Star icon (outline)
 */
export const StarIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/**
 * Star filled icon
 */
export const StarFilledIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

/**
 * Star half icon
 */
export const StarHalfIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354V3.5a.99.99 0 01.212-.29z" clipRule="evenodd" />
    <path d="M12 18.354l-4.627 2.826c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434L10.788 3.21A1.271 1.271 0 0112 3.5v14.854z" opacity="0.25" />
  </svg>
);

/**
 * Reputation star for user ratings
 */
export const ReputationStarIcon: React.FC<{ filled?: boolean; size?: number; className?: string }> = ({
  filled = false,
  size = 24,
  className = '',
}) => (
  filled 
    ? <StarFilledIcon size={size} className={`text-yellow-400 ${className}`} />
    : <StarIcon size={size} className={`text-gray-300 ${className}`} />
);

/**
 * Star rating component
 */
export const StarRating: React.FC<{
  rating: number;
  max?: number;
  size?: number;
  className?: string;
}> = ({ rating, max = 5, size = 20, className = '' }) => (
  <div className={`flex items-center gap-0.5 ${className}`}>
    {Array.from({ length: max }).map((_, i) => (
      <ReputationStarIcon
        key={i}
        filled={i < rating}
        size={size}
      />
    ))}
  </div>
);

export default StarIcon;

