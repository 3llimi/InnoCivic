import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '../forms/SearchBar';
import { BaseComponentProps, User } from '../../types';
import { useTheme } from '../../hooks/ThemeContext';
import { useSidebar } from '../../hooks/SidebarContext';

interface NavbarProps extends BaseComponentProps {
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSearch,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
    if (query.trim()) {
      navigate(`/innocivic/search?q=${encodeURIComponent(query)}`);
    }
  };

  const userMenuItems = [
    { label: 'Dashboard', href: '/innocivic/dashboard' },
    { label: 'My Datasets', href: '/innocivic/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Help', href: '/help' },
  ];

  return (
    <header className={`bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:text-gray-500 dark:hover:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex items-center ml-4">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="InnoCivic"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">InnoCivic</span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-4">
            <SearchBar
              placeholder="Search datasets, categories, tags..."
              onSearch={handleSearch}
              value={searchQuery}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-110 active:scale-95"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        // Sun icon
        <svg className="h-5 w-5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        // Moon icon
        <svg className="h-5 w-5 transition-transform duration-300 rotate-[-15deg]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
};
