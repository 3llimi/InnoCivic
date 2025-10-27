import React from 'react';
import { BaseComponentProps, User } from '../../types';

interface AvatarProps extends BaseComponentProps {
  user?: User;
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallback?: React.ReactNode;
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  src,
  alt,
  size = 'md',
  shape = 'circle',
  fallback,
  showStatus = false,
  status = 'offline',
  className = '',
}) => {
  const getSizeClasses = () => {
    const sizes = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl',
    };
    return sizes[size];
  };

  const getShapeClasses = () => {
    return shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  };

  const getStatusClasses = () => {
    const statusColors = {
      online: 'bg-green-400',
      offline: 'bg-gray-400',
      away: 'bg-yellow-400',
      busy: 'bg-red-400',
    };
    return statusColors[status];
  };

  const getStatusSizeClasses = () => {
    const statusSizes = {
      xs: 'h-1.5 w-1.5',
      sm: 'h-2 w-2',
      md: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
    };
    return statusSizes[size];
  };

  const getInitials = () => {
    if (user?.fullName) {
      return user.fullName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.username) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const getAltText = () => {
    if (alt) return alt;
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    return 'Avatar';
  };

  const imageSrc = src || user?.avatarUrl;
  const displayName = user?.fullName || user?.username || 'User';

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`${getSizeClasses()} ${getShapeClasses()} bg-gray-300 flex items-center justify-center text-gray-600 font-medium overflow-hidden`}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={getAltText()}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}

        <div className={`${imageSrc ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
          {fallback || getInitials()}
        </div>
      </div>

      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 ${getStatusSizeClasses()} ${getStatusClasses()} ${getShapeClasses()} border-2 border-white`}
          title={`${displayName} is ${status}`}
        />
      )}
    </div>
  );
};
