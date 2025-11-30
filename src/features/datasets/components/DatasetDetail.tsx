import React from 'react';
import { Dataset } from '../../../types';
import { DataCard } from '../../../components/data-display/DataCard';
import { Badge } from '../../../components/data-display/Badge';
import { Chip } from '../../../components/data-display/Chip';
import { Avatar } from '../../../components/data-display/Avatar';
import { SimpleTable } from '../../../components/data-display/SimpleTable';
import { BaseComponentProps } from '../../../types';

interface DatasetDetailProps extends BaseComponentProps {
  dataset: Dataset;
  onDownload?: (id: string) => void;
  onShare?: (id: string) => void;
  onRate?: (id: string, rating: number) => void;
  onComment?: (id: string, comment: string) => void;
}

export const DatasetDetail: React.FC<DatasetDetailProps> = ({
  dataset,
  onDownload,
  onShare,
  onRate,
  onComment,
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
      month: 'long',
      day: 'numeric',
    });
  };

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const metadata = [
    { field: 'Title', value: dataset.title },
    { field: 'Description', value: dataset.description },
    { field: 'Category', value: dataset.category.name },
    { field: 'Format', value: dataset.format },
    { field: 'File Size', value: formatFileSize(dataset.fileSize) },
    { field: 'Source', value: dataset.source },
    { field: 'License', value: dataset.license },
    { field: 'Geographic Coverage', value: dataset.geographicCoverage },
    { field: 'Time Period', value: `${dataset.timePeriod.start} - ${dataset.timePeriod.end}` },
    { field: 'Uploaded By', value: dataset.uploadedBy.fullName },
    { field: 'Upload Date', value: formatDate(dataset.uploadedAt) },
    { field: 'Last Updated', value: formatDate(dataset.lastUpdated) },
    { field: 'Version', value: dataset.version },
    { field: 'Status', value: dataset.status },
    { field: 'Downloads', value: dataset.downloadCount.toString() },
    { field: 'Views', value: dataset.viewCount.toString() },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {dataset.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {dataset.description}
            </p>

            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="primary" size="md">
                {dataset.category.name}
              </Badge>
              <Badge variant="secondary" size="md">
                {dataset.format}
              </Badge>
              <Badge variant={getQualityColor(dataset.qualityScore)} size="md">
                Quality: {dataset.qualityScore}/10
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              {dataset.tags.map((tag) => (
                <Chip key={tag} size="md" variant="default">
                  {tag}
                </Chip>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2 ml-6">
            <button
              onClick={() => onDownload?.(dataset.id)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Download Dataset
            </button>
            <button
              onClick={() => onShare?.(dataset.id)}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DataCard title="Downloads" className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {dataset.downloadCount.toLocaleString()}
          </div>
        </DataCard>
        <DataCard title="Views" className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {dataset.viewCount.toLocaleString()}
          </div>
        </DataCard>
        <DataCard title="Quality Score" className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {dataset.qualityScore}/10
          </div>
        </DataCard>
        <DataCard title="File Size" className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {formatFileSize(dataset.fileSize)}
          </div>
        </DataCard>
      </div>

      {/* Uploader Info */}
      <DataCard title="Uploaded by">
        <div className="flex items-center space-x-4">
          <Avatar user={dataset.uploadedBy} size="lg" />
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {dataset.uploadedBy.fullName}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {dataset.uploadedBy.affiliation || dataset.uploadedBy.userType}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Joined {new Date(dataset.uploadedBy.createdAt).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </DataCard>

      {/* Metadata */}
      <DataCard title="Dataset Information">
        <SimpleTable data={metadata} />
      </DataCard>

      {/* Additional Metadata */}
      {Object.keys(dataset.metadata).length > 0 && (
        <DataCard title="Additional Metadata">
          <SimpleTable
            data={Object.entries(dataset.metadata).map(([key, value]) => ({
              field: key,
              value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            }))}
          />
        </DataCard>
      )}

      {/* Preview Data */}
      {dataset.previewData && dataset.previewData.length > 0 && (
        <DataCard title="Data Preview">
          <div className="overflow-x-auto">
            <SimpleTable
              data={dataset.previewData.slice(0, 10)}
              headers={Object.keys(dataset.previewData[0])}
              compact
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Showing first 10 rows of {dataset.previewData.length} total rows
          </p>
        </DataCard>
      )}
    </div>
  );
};
