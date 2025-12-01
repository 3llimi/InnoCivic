import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { BaseComponentProps } from '../../types';

interface AppLayoutProps extends BaseComponentProps {
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col ${className}`}>
      <Navbar />

      <div className="flex flex-1 w-full">
        {showSidebar && (
          <Sidebar />
        )}

        <main className="flex-1 w-full bg-white/0 dark:bg-transparent">
          <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};
