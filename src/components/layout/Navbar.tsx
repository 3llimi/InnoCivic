import React, { useEffect, useRef, useState } from 'react';
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
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useSidebar();

  useEffect(() => {
    const updateNavbarHeight = () => {
      if (headerRef.current) {
        document.documentElement.style.setProperty(
          '--navbar-height',
          `${headerRef.current.offsetHeight}px`,
        );
      }
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    return () => window.removeEventListener('resize', updateNavbarHeight);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
    if (query.trim()) {
      navigate(`/innocivic/datasets?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const userMenuItems = [
    { label: 'Dashboard', href: '/innocivic/dashboard' },
    { label: 'My Datasets', href: '/innocivic/dashboard' },
    { label: 'Settings', href: '/settings' },
    { label: 'Help', href: '/help' },
  ];

  return (
    <header
      ref={headerRef}
      className={`bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40 ${className}`}
    >
      <div className="px-4 sm:px-6 lg:px-8 max-w-full">
        <div className="flex flex-wrap items-center gap-4 py-3 lg:py-0">
          {/* Left side */}
          <div className="flex items-center flex-1 min-w-0">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 lg:hidden"
              aria-label="Open navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/innocivic" className="flex items-center ml-3 sm:ml-4 min-w-0">
              <img
                className="h-8 w-auto"
                src="/logo.svg"
                alt="InnoCivic"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">InnoCivic</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggleButton />
          </div>

          {/* Search */}
          <div className="w-full order-3 lg:order-none lg:flex-1 lg:max-w-lg">
            <SearchBar
              placeholder="Search datasets, categories, tags..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full"
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
