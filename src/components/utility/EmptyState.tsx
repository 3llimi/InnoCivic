import React from 'react';
import { BaseComponentProps } from '../../types';

interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  size = 'md',
  className = '',
}) => {
  const getSizeClasses = () => {
    const sizes = {
      sm: 'py-8',
      md: 'py-12',
      lg: 'py-16',
    };
    return sizes[size];
  };

  const getIconSize = () => {
    const sizes = {
      sm: 'h-8 w-8',
      md: 'h-12 w-12',
      lg: 'h-16 w-16',
    };
    return sizes[size];
  };

  const getTitleSize = () => {
    const sizes = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
    };
    return sizes[size];
  };

  const getDescriptionSize = () => {
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    };
    return sizes[size];
  };

  const defaultIcon = (
    <svg
      className={`${getIconSize()} text-gray-400`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  return (
    <div className={`text-center ${getSizeClasses()} ${className}`}>
      <div className="flex justify-center">
        {icon || defaultIcon}
      </div>

      <h3 className={`mt-2 font-medium text-gray-900 ${getTitleSize()}`}>
        {title}
      </h3>

      {description && (
        <p className={`mt-1 text-gray-500 ${getDescriptionSize()}`}>
          {description}
        </p>
      )}

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};
