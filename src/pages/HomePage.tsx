import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SearchBar } from '../components/forms/SearchBar';
import { DataCard } from '../components/data-display/DataCard';
import { Badge } from '../components/data-display/Badge';
import { Alert } from '../components/feedback/Alert';
import { Loader } from '../components/feedback/Loader';
import type { Dataset } from '../types';
import { fetchCategories, fetchDatasets, API_BASE_URL } from '../services/api';

interface DashboardStats {
  totalDatasets: number;
  totalCategories: number;
  totalDownloads: number;
  totalViews: number;
}

interface TagStat {
  name: string;
  count: number;
}

const numberFormatter = new Intl.NumberFormat();
const formatNumber = (value: number) => numberFormatter.format(value);

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalDatasets: 0,
    totalCategories: 0,
    totalDownloads: 0,
    totalViews: 0,
  });
  const [featuredDatasets, setFeaturedDatasets] = useState<Dataset[]>([]);
  const [categoryStats, setCategoryStats] = useState<{ name: string; value: number }[]>([]);
  const [popularTags, setPopularTags] = useState<TagStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesResponse, datasetResponse] = await Promise.all([
          fetchCategories(),
          fetchDatasets({ page: 1, limit: 100, sort: 'recent' }),
        ]);

        const categories = categoriesResponse?.success && Array.isArray(categoriesResponse.data)
          ? categoriesResponse.data
          : [];

        setCategoryStats(
          categories.map((category) => ({
            name: category.name || category.id,
            value: category.datasetCount ?? 0,
          })),
        );

        const totalCategories = categories.length;

        if (!datasetResponse?.success) {
          throw new Error('Unable to load dataset statistics');
        }

        const pagination = (datasetResponse as Record<string, any>).pagination || {};
        const limit = pagination.limit ?? 100;
        const totalDatasets =
          typeof pagination.total === 'number'
            ? pagination.total
            : Array.isArray(datasetResponse.data)
            ? datasetResponse.data.length
            : 0;
        let datasets = Array.isArray(datasetResponse.data) ? datasetResponse.data : [];
        const totalPages =
          typeof pagination.totalPages === 'number'
            ? pagination.totalPages
            : totalDatasets
            ? Math.ceil(totalDatasets / limit)
            : datasets.length
            ? 1
            : 0;

        let totalDownloads = datasets.reduce((sum, dataset) => sum + (dataset.downloadCount ?? 0), 0);
        let totalViews = datasets.reduce((sum, dataset) => sum + (dataset.viewCount ?? 0), 0);

        if (totalPages > 1) {
          for (let page = 2; page <= totalPages; page += 1) {
            const response = await fetchDatasets({ page, limit, sort: 'recent' });
            if (!response?.success) {
              break;
            }
            const pageData = Array.isArray(response.data) ? response.data : [];
            datasets = datasets.concat(pageData);
            totalDownloads += pageData.reduce((sum, dataset) => sum + (dataset.downloadCount ?? 0), 0);
            totalViews += pageData.reduce((sum, dataset) => sum + (dataset.viewCount ?? 0), 0);
          }
        }

        setStats({
          totalDatasets,
          totalCategories,
          totalDownloads,
          totalViews,
        });

        const sortedByDownloads = [...datasets].sort(
          (a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0),
        );
        setFeaturedDatasets(sortedByDownloads.slice(0, 3));

        const tagCounts = new Map<string, number>();
        datasets.forEach((dataset) => {
          dataset.tags?.forEach((tag) => {
            const normalized = tag.trim().toLowerCase();
            if (!normalized) {
              return;
            }
            tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
          });
        });

        const tagStats = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));
        setPopularTags(tagStats);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        setFeaturedDatasets([]);
        setCategoryStats([]);
        setPopularTags([]);
        setStats({
          totalDatasets: 0,
          totalCategories: 0,
          totalDownloads: 0,
          totalViews: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/innocivic/datasets?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleDatasetView = (id: string) => {
    navigate(`/innocivic/datasets/${id}`);
  };

  const handleDatasetDownload = (id: string) => {
    if (!id) {
      return;
    }
    window.open(
      `${API_BASE_URL}/api/datasets/${encodeURIComponent(id)}/download`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const hasStatsData =
    stats.totalDatasets > 0 ||
    stats.totalCategories > 0 ||
    stats.totalDownloads > 0 ||
    stats.totalViews > 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white rounded-lg">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to InnoCivic
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Centralizing, enriching, and sharing public datasets for Russia's civic tech community
          </p>

          <div className="max-w-2xl mx-auto bg-white dark:bg-white/95 rounded-lg px-2 py-1.5 shadow-xl">
            <SearchBar
              placeholder="Search datasets, categories, tags..."
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </section>

        {error && (
          <Alert
            type="error"
            title="Unable to load live statistics"
            message={error}
          />
        )}

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataCard title="Total Datasets" className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {hasStatsData ? formatNumber(stats.totalDatasets) : '—'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Live count</p>
          </DataCard>
          <DataCard title="Total Categories" className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {hasStatsData ? formatNumber(stats.totalCategories) : '—'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Distinct data domains</p>
          </DataCard>
          <DataCard title="Downloads" className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {hasStatsData ? formatNumber(stats.totalDownloads) : '—'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Cumulative file downloads</p>
          </DataCard>
          <DataCard title="Views" className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {hasStatsData ? formatNumber(stats.totalViews) : '—'}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dataset page visits</p>
          </DataCard>
        </section>

        {/* Featured Datasets */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Datasets</h2>
            <Badge variant="primary">
              {hasStatsData ? `${formatNumber(featuredDatasets.length)} highlighted` : 'Top downloads'}
            </Badge>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader text="Loading datasets..." />
            </div>
          ) : featuredDatasets.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No datasets available yet. Upload your first dataset to get started.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDatasets.map((dataset) => (
                <DataCard
                  key={dataset.id}
                  title={dataset.title}
                  subtitle={dataset.description}
                  onClick={() => handleDatasetView(dataset.id)}
                  hoverable
                >
                  <div className="space-y-2">
                    <Badge variant="primary" size="sm">
                      {dataset.category?.name || 'Uncategorized'}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {dataset.format}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatNumber(dataset.downloadCount ?? 0)} downloads • {formatNumber(dataset.viewCount ?? 0)} views
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDatasetView(dataset.id);
                        }}
                      >
                        View details
                      </button>
                      <button
                        className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:underline"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDatasetDownload(dataset.id);
                        }}
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </DataCard>
              ))}
            </div>
          )}
        </section>

        {/* Category Distribution */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dataset Categories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataCard title="Distribution by Category">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader size="sm" text="Loading categories..." />
                </div>
              ) : categoryStats.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No categories detected yet. Categorize datasets to see distribution.
                </p>
              ) : (
                <div className="space-y-2">
                  {categoryStats.map((stat) => (
                    <div key={stat.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${stats.totalDatasets ? Math.min(
                                100,
                                (stat.value / stats.totalDatasets) * 100 || 0,
                              ) : 0}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatNumber(stat.value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DataCard>

            <DataCard title="Popular Tags">
              {loading ? (
                <div className="flex justify-center py-6">
                  <Loader size="sm" text="Analyzing tags..." />
                </div>
              ) : popularTags.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Tags will appear once datasets include them.
                </p>
              ) : (
                <div className="space-y-2">
                  {popularTags.map((tag) => (
                    <div key={tag.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{tag.name}</span>
                      <Badge variant="secondary" size="sm">
                        {formatNumber(tag.count)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </DataCard>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Ready to contribute?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Join our community of researchers, journalists, and civic tech developers.
            Upload your datasets and help build Russia's most comprehensive civic data platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/innocivic/upload')}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
            >
              Upload Dataset
            </button>
            <button
              onClick={() => navigate('/innocivic/datasets')}
              className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Browse Datasets
            </button>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};
