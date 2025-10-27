import React from 'react';
import { AppLayout } from './AppLayout';
import { BaseComponentProps } from '../../types';

interface AdminLayoutProps extends BaseComponentProps {
  showSidebar?: boolean;
}

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Datasets', href: '/admin/datasets', icon: '📁' },
  { label: 'Users', href: '/admin/users', icon: '👥' },
  { label: 'Categories', href: '/admin/categories', icon: '🏷️' },
  { label: 'Analytics', href: '/admin/analytics', icon: '📈' },
  { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  showSidebar = true,
  className = '',
}) => {
  return (
    <AppLayout
      showSidebar={showSidebar}
      className={className}
    >
      <div className="space-y-6">
        {/* Admin Header */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <strong>Admin Panel:</strong> You are viewing the administrative interface.
                Changes made here affect all users.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Navigation */}
        {showSidebar && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Admin Navigation</h3>
            </div>
            <nav className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {adminNavItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center p-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {children}
        </div>
      </div>
    </AppLayout>
  );
};
