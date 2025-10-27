import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataCard } from '../components/data-display/DataCard';
import { EmptyState } from '../components/utility/EmptyState';

export const UploadPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Upload Dataset</h1>
        </div>

        <DataCard title="Coming Soon">
          <EmptyState
            title="Upload Feature"
            description="Upload and share your datasets with the community. Coming soon."
            icon={
              <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
          />
        </DataCard>
      </div>
    </AppLayout>
  );
};
