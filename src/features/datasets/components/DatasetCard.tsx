import React from 'react';
import { Dataset } from '../../../types';
import { DataCard } from '../../../components/data-display/DataCard';
import { Badge } from '../../../components/data-display/Badge';
import { Chip } from '../../../components/data-display/Chip';
import { Avatar } from '../../../components/data-display/Avatar';
import { BaseComponentProps } from '../../../types';

interface DatasetCardProps extends BaseComponentProps {
  dataset: Dataset;
  variant?: 'compact' | 'detailed';
  showActions?: boolean;
  onSelect?: (id: string) => void;
  onDownload?: (id: string) => void;
  onView?: (id: string) => void;
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  dataset,
  variant = 'detailed',
  showActions = true,
  onSelect,
  onDownload,
  onView,
  className = '',
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const actions = showActions ? (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onView?.(dataset.id)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        View
      </button>
      <button
        onClick={() => onDownload?.(dataset.id)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        Download
      </button>
    </div>
  ) : undefined;

  const footer = (
    <div className="flex items-center justify-between text-sm text-gray-500">
      <div className="flex items-center space-x-4">
        <span className="flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {dataset.downloadCount}
        </span>
        <span className="flex items-center">
          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {dataset.viewCount}
        </span>
      </div>
      <span>{formatDate(dataset.uploadedAt)}</span>
    </div>
  );

  if (variant === 'compact') {
    return (
      <div
        className={`p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer ${className}`}
        onClick={() => onSelect?.(dataset.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {dataset.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {dataset.category.name} • {dataset.format} • {formatFileSize(dataset.fileSize)}
            </p>
          </div>
          <Badge variant={getQualityColor(dataset.qualityScore)} size="sm">
            {dataset.qualityScore}/10
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <DataCard
      title={dataset.title}
      subtitle={dataset.description}
      actions={actions}
      footer={footer}
      hoverable
      className={className}
    >
      <div className="space-y-3">
        {/* Category and Format */}
        <div className="flex items-center space-x-2">
          <Badge variant="primary" size="sm">
            {dataset.category.name}
          </Badge>
          <Badge variant="secondary" size="sm">
            {dataset.format}
          </Badge>
          <Badge variant={getQualityColor(dataset.qualityScore)} size="sm">
            Quality: {dataset.qualityScore}/10
          </Badge>
        </div>

        {/* Tags */}
        {dataset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dataset.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} size="sm" variant="default">
                {tag}
              </Chip>
            ))}
            {dataset.tags.length > 3 && (
              <Chip size="sm" variant="default">
                +{dataset.tags.length - 3} more
              </Chip>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Size:</span> {formatFileSize(dataset.fileSize)}
          </div>
          <div>
            <span className="font-medium">Source:</span> {dataset.source}
          </div>
          <div>
            <span className="font-medium">License:</span> {dataset.license}
          </div>
          <div>
            <span className="font-medium">Coverage:</span> {dataset.geographicCoverage}
          </div>
        </div>

        {/* Uploader */}
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
          <Avatar user={dataset.uploadedBy} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {dataset.uploadedBy.fullName}
            </p>
            <p className="text-xs text-gray-500">
              {dataset.uploadedBy.affiliation || dataset.uploadedBy.userType}
            </p>
          </div>
        </div>
      </div>
    </DataCard>
  );
};
