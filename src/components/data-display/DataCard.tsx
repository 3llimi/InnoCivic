import React from 'react';
import { BaseComponentProps } from '../../types';

interface DataCardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  hoverable?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const DataCard: React.FC<DataCardProps> = ({
  children,
  title,
  subtitle,
  image,
  imageAlt,
  actions,
  footer,
  variant = 'default',
  hoverable = false,
  loading = false,
  className = '',
  onClick,
}) => {
  const getCardClasses = () => {
    const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex flex-col h-full';
    const variantClasses = {
      default: 'shadow-sm',
      elevated: 'shadow-lg',
      outlined: 'border border-gray-200 dark:border-gray-700',
    };
    const hoverClasses = hoverable ? 'hover:shadow-md transition-shadow duration-200' : '';

    return `${baseClasses} ${variantClasses[variant]} ${hoverClasses}`;
  };

  if (loading) {
    return (
      <div className={`${getCardClasses()} ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getCardClasses()} ${className}`} onClick={onClick}>
      {/* Image */}
      {image && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={image}
            alt={imageAlt || title || 'Card image'}
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Header */}
      {(title || subtitle || actions) && (
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 text-left">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="ml-4 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {children && (
        <div className={`px-6 ${title || subtitle || actions ? 'pt-0 pb-4' : 'p-6'} flex-1`}>
          {children}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};
