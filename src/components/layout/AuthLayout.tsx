import React from 'react';
import { BaseComponentProps } from '../../types';

interface AuthLayoutProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title = 'Welcome to InnoCivic',
  subtitle = 'Join Russia\'s civic data community',
  showLogo = true,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${className}`}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {showLogo && (
          <div className="flex justify-center">
            <div className="flex items-center">
              <img
                className="h-12 w-auto"
                src="/logo.svg"
                alt="InnoCivic"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="ml-3 text-3xl font-bold text-gray-900 dark:text-gray-100">InnoCivic</span>
            </div>
          </div>
        )}

        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
};
