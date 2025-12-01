import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataCard } from '../components/data-display/DataCard';
import { EmptyState } from '../components/utility/EmptyState';
import { Loader } from '../components/feedback/Loader';
import { Alert } from '../components/feedback/Alert';
import { BarChart } from '../features/visualizations/components/BarChart';
import type { ChartData, Dataset } from '../types';
import { fetchDatasets } from '../services/api';

const formatMonthLabel = (dateString: string) => {
  if (!dateString) {
    return 'Unknown';
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${month} ${year}`;
};

const buildCategoryChartData = (datasets: Dataset[]): ChartData[] => {
  const counts = new Map<string, number>();

  datasets.forEach((dataset) => {
    const name = dataset.category?.name || 'Uncategorized';
    counts.set(name, (counts.get(name) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const buildFormatChartData = (datasets: Dataset[]): ChartData[] => {
  const totals = new Map<string, number>();

  datasets.forEach((dataset) => {
    const format = dataset.format || 'Unknown';
    const downloads = dataset.downloadCount ?? 0;
    totals.set(format, (totals.get(format) ?? 0) + downloads);
  });

  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const buildUploadTrendData = (datasets: Dataset[]): ChartData[] => {
  const buckets = new Map<string, number>();

  datasets.forEach((dataset) => {
    const label = formatMonthLabel(dataset.uploadedAt || dataset.lastUpdated);
    if (label === 'Unknown') {
      return;
    }
    buckets.set(label, (buckets.get(label) ?? 0) + 1);
  });

  const entries = Array.from(buckets.entries());

  // Sort by actual date again so the chart is chronological
  entries.sort((a, b) => {
    const aDate = new Date(a[0]);
    const bDate = new Date(b[0]);
    return aDate.getTime() - bDate.getTime();
  });

  return entries.map(([name, value]) => ({ name, value }));
};

export const VisualizationsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllDatasets = async () => {
      try {
        setLoading(true);
        setError(null);

        // Start with a reasonably large page size to reduce requests
        const firstPage = await fetchDatasets({ page: 1, limit: 100, sort: 'recent' });
        if (!firstPage?.success) {
          setDatasets([]);
          return;
        }

        const firstItems = Array.isArray(firstPage.data) ? firstPage.data : [];
        const collected: Dataset[] = [...firstItems];

        const pagination = (firstPage as Record<string, any>).pagination || {};
        const totalPages = typeof pagination.totalPages === 'number' ? pagination.totalPages : 1;
        const limit = pagination.limit ?? 100;

        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page += 1) {
            const response = await fetchDatasets({ page, limit, sort: 'recent' });
            if (!response?.success) {
              break;
            }
            const pageItems = Array.isArray(response.data) ? response.data : [];
            collected.push(...pageItems);
          }
        }

        setDatasets(collected);
      } catch (err) {
        console.error('Failed to load visualization data', err);
        setError(err instanceof Error ? err.message : 'Failed to load visualization data');
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllDatasets();
  }, []);

  const categoryData = useMemo(() => buildCategoryChartData(datasets), [datasets]);
  const formatData = useMemo(() => buildFormatChartData(datasets), [datasets]);
  const uploadTrendData = useMemo(() => buildUploadTrendData(datasets), [datasets]);

  const hasAnyData =
    categoryData.length > 0 ||
    formatData.length > 0 ||
    uploadTrendData.length > 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Visualizations</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
              Live charts built directly from the datasets available in InnoCivic.
            </p>
          </div>
        </div>

        {error && (
          <Alert
            type="error"
            title="Unable to load visualization data"
            message={error}
          />
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" text="Building visualizations from your datasets..." />
          </div>
        ) : hasAnyData ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DataCard title="Datasets by Category">
                <BarChart
                  data={categoryData}
                  xAxisKey="name"
                  yAxisKey="value"
                  height={320}
                  showLegend={false}
                  title="Number of datasets per category (live data)"
                />
              </DataCard>

              <DataCard title="Downloads by Format">
                <BarChart
                  data={formatData}
                  xAxisKey="name"
                  yAxisKey="value"
                  height={320}
                  showLegend={false}
                  title="Total downloads per file format (live data)"
                />
              </DataCard>
            </div>

            <DataCard title="Upload Activity Over Time">
              <BarChart
                data={uploadTrendData}
                xAxisKey="name"
                yAxisKey="value"
                height={360}
                showLegend={false}
                title="Number of datasets uploaded per month (live data)"
              />
            </DataCard>
          </>
        ) : (
          <DataCard>
            <EmptyState
              title="No visualization data available yet"
              description="Once datasets are uploaded and have download activity, charts will appear here automatically."
            />
          </DataCard>
        )}
      </div>
    </AppLayout>
  );
};
