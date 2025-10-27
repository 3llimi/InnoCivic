import React from 'react';
import { Dataset } from '../../../types';
import { DatasetCard } from './DatasetCard';
import { List } from '../../../components/data-display/List';
import { EmptyState } from '../../../components/utility/EmptyState';
import { Skeleton } from '../../../components/data-display/Skeleton';
import { BaseComponentProps } from '../../../types';

interface DatasetListProps extends BaseComponentProps {
  datasets: Dataset[];
  loading?: boolean;
  variant?: 'grid' | 'list';
  showActions?: boolean;
  onDatasetSelect?: (id: string) => void;
  onDatasetDownload?: (id: string) => void;
  onDatasetView?: (id: string) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export const DatasetList: React.FC<DatasetListProps> = ({
  datasets,
  loading = false,
  variant = 'grid',
  showActions = true,
  onDatasetSelect,
  onDatasetDownload,
  onDatasetView,
  emptyMessage = 'No datasets found',
  emptyDescription = 'Try adjusting your search or filter criteria.',
  emptyAction,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={className}>
        {variant === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height="300px" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height="120px" />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        action={emptyAction}
        className={className}
      />
    );
  }

  if (variant === 'list') {
    const listItems = datasets.map((dataset) => ({
      id: dataset.id,
      content: (
        <div className="flex items-center space-x-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {dataset.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {dataset.description}
            </p>
            <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{dataset.category.name}</span>
              <span>•</span>
              <span>{dataset.format}</span>
              <span>•</span>
              <span>{dataset.downloadCount} downloads</span>
            </div>
          </div>
        </div>
      ),
      actions: showActions ? (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDatasetView?.(dataset.id)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => onDatasetDownload?.(dataset.id)}
            className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Download
          </button>
        </div>
      ) : undefined,
    }));

    return (
      <List
        items={listItems}
        hoverable
        selectable
        onItemSelect={onDatasetSelect}
        className={className}
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {datasets.map((dataset) => (
        <DatasetCard
          key={dataset.id}
          dataset={dataset}
          variant="detailed"
          showActions={showActions}
          onSelect={onDatasetSelect}
          onDownload={onDatasetDownload}
          onView={onDatasetView}
        />
      ))}
    </div>
  );
};
