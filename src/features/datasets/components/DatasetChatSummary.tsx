import React, { useMemo } from 'react';
import { Dataset } from '../../../types';

interface DatasetChatSummaryProps {
  dataset: Dataset;
  className?: string;
}

export const DatasetChatSummary: React.FC<DatasetChatSummaryProps> = ({
  dataset,
  className = '',
}) => {
  const summaryText = useMemo(() => {
    const parts: string[] = [];

    if (dataset.title) {
      parts.push(`This dataset is called "${dataset.title}".`);
    }

    if (dataset.description) {
      parts.push(dataset.description);
    }

    if (dataset.category?.name) {
      parts.push(`It belongs to the "${dataset.category.name}" category.`);
    }

    if (dataset.geographicCoverage) {
      parts.push(`Geographic coverage: ${dataset.geographicCoverage}.`);
    }

    if (dataset.timePeriod?.start || dataset.timePeriod?.end) {
      const start = dataset.timePeriod?.start ?? 'unknown start';
      const end = dataset.timePeriod?.end ?? 'present';
      parts.push(`Time period covered: ${start} – ${end}.`);
    }

    if (dataset.format) {
      parts.push(`The primary file format is ${dataset.format}.`);
    }

    if (dataset.license) {
      parts.push(`License: ${dataset.license}.`);
    }

    if (typeof dataset.qualityScore === 'number') {
      parts.push(`Quality score: ${dataset.qualityScore}/10.`);
    }

    if (dataset.tags && dataset.tags.length > 0) {
      parts.push(`Key tags: ${dataset.tags.join(', ')}.`);
    }

    if (!parts.length) {
      return 'No detailed metadata is available for this dataset yet.';
    }

    return parts.join(' ');
  }, [dataset]);

  return (
    <div
      className={`flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-100 dark:border-gray-800 h-full ${className}`}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Dataset Assistant
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Automatic summary of what this dataset is about
          </p>
        </div>
        <span className="inline-flex h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              AI
            </div>
          </div>
          <div className="max-w-full">
            <div className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-none px-3 py-2 text-sm leading-relaxed">
              {summaryText}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <div className="relative">
          <input
            type="text"
            disabled
            className="w-full rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 pr-10 text-xs text-gray-500 dark:text-gray-400 cursor-not-allowed"
            value="Interactive chat coming soon. For now, review the automatic summary above."
            readOnly
          />
          <span className="absolute inset-y-0 right-3 flex items-center text-gray-400">
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 5L19 12L12 19"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
};
