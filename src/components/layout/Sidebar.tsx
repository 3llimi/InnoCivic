import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BaseComponentProps } from '../../types';
import { useSidebar } from '../../hooks/SidebarContext';

interface SidebarProps extends BaseComponentProps {}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Datasets',
    href: '/innocivic/datasets',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: 'Visualizations',
    href: '/innocivic/visualizations',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Upload',
    href: '/innocivic/upload',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    label: 'Categories',
    href: '/innocivic/categories',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    label: 'Search',
    href: '/innocivic/search',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

interface SidebarContentProps {
  collapsed: boolean;
  currentPath: string;
  onCollapseToggle?: () => void;
  onCloseMobile?: () => void;
  onLinkClick?: () => void;
  showCollapseToggle?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  collapsed,
  currentPath,
  onCollapseToggle,
  onCloseMobile,
  onLinkClick,
  showCollapseToggle = true,
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 border-b border-gray-200 dark:border-gray-700`}>
        {!collapsed && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Navigation</h2>
        )}
        <div className="flex items-center gap-1">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
              aria-label="Close navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {showCollapseToggle && onCollapseToggle && (
            <button
              onClick={onCollapseToggle}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => onLinkClick?.()}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                collapsed ? 'justify-center' : 'justify-start'
              } ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`${collapsed ? 'mr-0' : 'mr-3'} ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1 dark:text-gray-200">{item.label}</span>
                  {item.badge && (
                    <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/40 dark:text-blue-300">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p>InnoCivic v1.0.0</p>
            <p>© 2025 Civic Data Platform</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  className = '',
}) => {
  const location = useLocation();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobileSidebar } = useSidebar();

  return (
    <>
      <div
        className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-full transform transition-transform duration-300 lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isMobileOpen}
      >
        <SidebarContent
          collapsed={false}
          currentPath={location.pathname}
          onCloseMobile={closeMobileSidebar}
          onLinkClick={closeMobileSidebar}
          showCollapseToggle={false}
        />
      </aside>

      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 sticky ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${className}`}
        style={{
          top: 'var(--navbar-height, 64px)',
          height: 'calc(100vh - var(--navbar-height, 64px))',
        }}
      >
        <SidebarContent
          collapsed={isCollapsed}
          currentPath={location.pathname}
          onCollapseToggle={toggleSidebar}
        />
      </aside>
    </>
  );
};
