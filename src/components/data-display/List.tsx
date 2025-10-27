import React from 'react';
import { BaseComponentProps } from '../../types';

interface ListItem {
  id: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  avatar?: React.ReactNode;
  divider?: boolean;
}

interface ListProps extends BaseComponentProps {
  items: ListItem[];
  variant?: 'default' | 'bordered' | 'striped';
  size?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  selectable?: boolean;
  selectedItems?: string[];
  onItemSelect?: (itemId: string) => void;
  emptyMessage?: string;
}

export const List: React.FC<ListProps> = ({
  items,
  variant = 'default',
  size = 'md',
  hoverable = false,
  selectable = false,
  selectedItems = [],
  onItemSelect,
  emptyMessage = 'No items available',
  className = '',
}) => {
  const getListClasses = () => {
    const baseClasses = 'divide-y divide-gray-200 dark:divide-gray-700';
    const variantClasses = {
      default: 'bg-white dark:bg-gray-800',
      bordered: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
      striped: 'bg-white dark:bg-gray-800',
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  const getItemClasses = (item: ListItem, index: number) => {
    const baseClasses = 'flex items-center justify-between px-4 py-3';
    const sizeClasses = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4',
    };
    const hoverClasses = hoverable ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer' : '';
    const stripedClasses = variant === 'striped' && index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/30' : '';
    const selectedClasses = selectedItems.includes(item.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400' : '';

    return `${baseClasses} ${sizeClasses[size]} ${hoverClasses} ${stripedClasses} ${selectedClasses}`;
  };

  const handleItemClick = (item: ListItem) => {
    if (selectable && onItemSelect) {
      onItemSelect(item.id);
    }
  };

  if (items.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 dark:text-gray-400 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`${getListClasses()} ${className}`}>
      {items.map((item, index) => (
        <div key={item.id}>
          <div
            className={getItemClasses(item, index)}
            onClick={() => handleItemClick(item)}
          >
            <div className="flex items-center space-x-3 flex-1">
              {item.avatar && (
                <div className="flex-shrink-0">
                  {item.avatar}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {item.content}
              </div>
            </div>

            {item.actions && (
              <div className="flex-shrink-0 ml-4">
                {item.actions}
              </div>
            )}
          </div>

          {item.divider && index < items.length - 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          )}
        </div>
      ))}
    </div>
  );
};
