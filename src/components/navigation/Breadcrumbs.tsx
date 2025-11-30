import React from 'react';
import { BaseComponentProps } from '../../types';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  onNavigate?: (href: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = (
    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  onNavigate,
  className = '',
}) => {
  const handleClick = (item: BreadcrumbItem, event: React.MouseEvent) => {
    if (item.href && !item.current) {
      event.preventDefault();
      onNavigate?.(item.href);
    }
  };

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 dark:text-gray-500">
                {separator}
              </span>
            )}

            {item.current ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white" aria-current="page">
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                onClick={(e) => handleClick(item, e)}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
