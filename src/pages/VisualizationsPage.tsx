import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataCard } from '../components/data-display/DataCard';
import { EmptyState } from '../components/utility/EmptyState';

export const VisualizationsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Visualizations</h1>
        </div>

        <DataCard title="Coming Soon">
          <EmptyState
            title="Visualizations"
            description="Browse and interact with data visualizations coming soon."
            icon={
              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
        </DataCard>
      </div>
    </AppLayout>
  );
};
