import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { BaseComponentProps } from '../../types';
import { useSidebar } from '../../hooks/SidebarContext';

interface AppLayoutProps extends BaseComponentProps {
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  className = '',
}) => {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${className}`}>
      <Navbar />

      <div className="flex flex-1">
        {showSidebar && <Sidebar />}

        <main className={`flex-1 transition-all duration-300`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};
