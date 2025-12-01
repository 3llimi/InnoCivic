import React from 'react';
import { BaseComponentProps } from '../../types';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  badge?: number;
}

interface TabsProps extends BaseComponentProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className = '',
}) => {
  const getTabClasses = (item: TabItem) => {
    const baseClasses = 'px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    const variantClasses = {
      default: activeTab === item.id
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
      pills: activeTab === item.id
        ? 'bg-blue-600 text-white'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      underline: activeTab === item.id
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    };

    const disabledClasses = item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}`;
  };

  const getTabListClasses = () => {
    const baseClasses = 'flex space-x-1';
    const variantClasses = {
      default: 'bg-gray-100 p-1 rounded-lg',
      pills: 'space-x-1',
      underline: 'border-b border-gray-200',
    };
    const widthClasses = fullWidth ? 'w-full' : '';

    return `${baseClasses} ${variantClasses[variant]} ${widthClasses}`;
  };

  const activeTabContent = items.find(item => item.id === activeTab)?.content;

  const tabListClasses = `${getTabListClasses()} ${fullWidth ? '' : 'min-w-max'}`;

  return (
    <div className={className}>
      <div className={`overflow-x-auto ${fullWidth ? '' : '-mx-1 px-1'}`}>
        <div className={tabListClasses} role="tablist">
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeTab === item.id}
            aria-controls={`tabpanel-${item.id}`}
            id={`tab-${item.id}`}
            className={`${getTabClasses(item)} ${fullWidth ? 'flex-1' : ''}`}
            onClick={() => !item.disabled && onTabChange(item.id)}
            disabled={item.disabled}
          >
            <div className="flex items-center space-x-2">
              <span>{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.badge}
                </span>
              )}
            </div>
          </button>
        ))}
        </div>
      </div>

      {activeTabContent && (
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="mt-4"
        >
          {activeTabContent}
        </div>
      )}
    </div>
  );
};
