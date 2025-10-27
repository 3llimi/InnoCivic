import React from 'react';
import { BaseComponentProps } from '../../types';

interface BadgeProps extends BaseComponentProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = true,
  dot = false,
  removable = false,
  onRemove,
  className = '',
}) => {
  const getVariantClasses = () => {
    const variants = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    };
    return variants[variant];
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
      lg: 'px-3 py-1 text-base',
    };
    return sizes[size];
  };

  const getRoundedClasses = () => {
    return rounded ? 'rounded-full' : 'rounded';
  };

  const baseClasses = 'inline-flex items-center font-medium';
  const variantClasses = getVariantClasses();
  const sizeClasses = getSizeClasses();
  const roundedClasses = getRoundedClasses();

  if (dot) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <span className={`w-2 h-2 ${variantClasses.split(' ')[0]} rounded-full mr-2`}></span>
        <span className="text-sm text-gray-600 dark:text-gray-400">{children}</span>
      </span>
    );
  }

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${roundedClasses} ${className}`}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Remove badge"
        >
          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};
