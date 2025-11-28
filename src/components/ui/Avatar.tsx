import React from 'react';

/**
 * Avatar size types
 */
type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Avatar component
 */
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  onClick?: () => void;
}

/**
 * Size classes
 */
const sizeClasses: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: { container: 'h-6 w-6', text: 'text-xs', status: 'h-1.5 w-1.5' },
  sm: { container: 'h-8 w-8', text: 'text-sm', status: 'h-2 w-2' },
  md: { container: 'h-10 w-10', text: 'text-base', status: 'h-2.5 w-2.5' },
  lg: { container: 'h-12 w-12', text: 'text-lg', status: 'h-3 w-3' },
  xl: { container: 'h-16 w-16', text: 'text-xl', status: 'h-3.5 w-3.5' },
};

/**
 * Status colors
 */
const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

/**
 * Generate consistent color from string
 */
function stringToColor(str: string): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-green-500',
    'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Get initials from string
 */
function getInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Avatar component for user representations
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback = '?',
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = '',
  onClick,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const sizes = sizeClasses[size];

  const containerClasses = [
    'relative inline-flex items-center justify-center overflow-hidden rounded-full',
    'bg-gray-200 dark:bg-gray-700',
    sizes.container,
    onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} onClick={onClick}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover rounded-full"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className={`flex items-center justify-center ${stringToColor(fallback)} text-white font-medium ${sizes.text} h-full w-full`}>
          {getInitials(fallback)}
        </span>
      )}
      
      {showStatus && (
        <span className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-gray-900 ${statusColors[status]} ${sizes.status}`} />
      )}
    </div>
  );
};

/**
 * Wallet avatar using address
 */
export const WalletAvatar: React.FC<{
  address: string;
  size?: AvatarSize;
  className?: string;
}> = ({ address, size = 'md', className = '' }) => {
  // Create a gradient based on address
  const shortAddr = address.slice(2, 8);
  
  return (
    <Avatar
      fallback={shortAddr}
      size={size}
      className={className}
      alt={`Wallet ${address.slice(0, 6)}...${address.slice(-4)}`}
    />
  );
};

/**
 * Avatar group for multiple users
 */
export const AvatarGroup: React.FC<{
  children: React.ReactNode;
  max?: number;
  size?: AvatarSize;
  className?: string;
}> = ({ children, max = 4, size = 'md', className = '' }) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-gray-900 rounded-full">
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div className={`flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium ring-2 ring-white dark:ring-gray-900 ${sizeClasses[size].container} ${sizeClasses[size].text}`}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;

