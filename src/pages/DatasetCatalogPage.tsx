import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SearchBar } from '../components/forms/SearchBar';
import { Select } from '../components/forms/Select';
import { Checkbox } from '../components/forms/Checkbox';
import { Tabs } from '../components/navigation/Tabs';
import { Pagination } from '../components/navigation/Pagination';
import { DatasetList } from '../features/datasets/components/DatasetList';
import { Dataset } from '../types';
import { fetchDatasets, API_BASE_URL } from '../services/api';
import { Alert } from '../components/feedback/Alert';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'economy', label: 'Economy' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'transport', label: 'Transport' },
  { value: 'social', label: 'Social' },
];

const formats = [
  { value: 'all', label: 'All Formats' },
  { value: 'CSV', label: 'CSV' },
  { value: 'JSON', label: 'JSON' },
  { value: 'XLSX', label: 'Excel' },
  { value: 'XML', label: 'XML' },
  { value: 'PDF', label: 'PDF' },
];

export const DatasetCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDatasets, setTotalDatasets] = useState(0);

  // File size filter state
  const [sizeFilters, setSizeFilters] = useState({
    small: false,
    medium: false,
    large: false,
  });

  // Quality score filter state
  const [qualityFilters, setQualityFilters] = useState({
    high: false,
    medium: false,
    low: false,
  });

  // Date range filter state
  const [dateFilters, setDateFilters] = useState({
    last7days: false,
    last30days: false,
    lastYear: false,
  });

  const appliedFilters = useMemo(
    () => ({
      searchQuery,
      selectedCategory,
      selectedFormat,
      sortBy,
      currentPage,
    }),
    [searchQuery, selectedCategory, selectedFormat, sortBy, currentPage],
  );

  useEffect(() => {
    const loadDatasets = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number | boolean> = {
          page: currentPage,
          limit: pageSize,
          sort: sortBy,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }
        if (selectedFormat !== 'all') {
          params.format = selectedFormat;
        }

        const response = await fetchDatasets(params);
        if (response?.success) {
          const items = Array.isArray(response.data) ? response.data : [];
          setDatasets(items);
          const pagination = (response as Record<string, any>).pagination;
          if (pagination?.total !== undefined) {
            setTotalDatasets(Number(pagination.total));
          } else {
            setTotalDatasets(items.length);
          }
        } else {
          setDatasets([]);
          setTotalDatasets(0);
        }
      } catch (err) {
        console.error('Failed to load datasets', err);
        setError(err instanceof Error ? err.message : 'Failed to load datasets');
        setDatasets([]);
        setTotalDatasets(0);
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters]);

  const updateURL = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL({ q: query });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    updateURL({ category });
  };

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    setCurrentPage(1);
    updateURL({ format });
  };

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode as 'grid' | 'list');
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateURL({ sort });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDatasetView = (id: string) => {
    navigate(`/datasets/${id}`);
  };

  const handleDatasetDownload = (id: string) => {
    window.open(`${API_BASE_URL}/api/datasets/${encodeURIComponent(id)}/download`, '_blank', 'noopener,noreferrer');
  };

  // Filter handlers
  const handleSizeFilterChange = (filter: 'small' | 'medium' | 'large', checked: boolean) => {
    setSizeFilters(prev => ({ ...prev, [filter]: checked }));
  };

  const handleQualityFilterChange = (filter: 'high' | 'medium' | 'low', checked: boolean) => {
    setQualityFilters(prev => ({ ...prev, [filter]: checked }));
  };

  const handleDateFilterChange = (filter: 'last7days' | 'last30days' | 'lastYear', checked: boolean) => {
    setDateFilters(prev => ({ ...prev, [filter]: checked }));
  };

  const tabItems = [
    {
      id: 'all',
      label: 'All Datasets',
      content: null,
    },
    {
      id: 'featured',
      label: 'Featured',
      content: null,
    },
    {
      id: 'recent',
      label: 'Recently Added',
      content: null,
    },
    {
      id: 'popular',
      label: 'Most Popular',
      content: null,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {error && (
          <Alert
            type="error"
            title="Unable to load datasets"
            message={error}
          />
        )}
        {/* Header */}
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dataset Catalog</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse and discover public datasets from across Russia
            </p>
          </div>

          <div className="flex items-center justify-center lg:justify-end space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Filters
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                placeholder="Search datasets..."
                value={searchQuery}
                onSearch={handleSearch}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select
                options={categories}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Category"
                className="w-full sm:w-48"
                wrapperClassName="dark:text-gray-100"
              />

              <Select
                options={formats}
                value={selectedFormat}
                onChange={handleFormatChange}
                placeholder="Format"
                className="w-full sm:w-48"
                wrapperClassName="dark:text-gray-100"
              />

              <Select
                options={[
                  { value: 'recent', label: 'Most Recent' },
                  { value: 'popular', label: 'Most Popular' },
                  { value: 'name', label: 'Name A-Z' },
                  { value: 'size', label: 'File Size' },
                ]}
                value={sortBy}
                onChange={handleSortChange}
                placeholder="Sort by"
                className="w-full sm:w-48"
                wrapperClassName="dark:text-gray-100"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {(showFilters || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File Size</h4>
                  <div className="space-y-2">
                    <Checkbox
                      label="Small (< 1MB)"
                      checked={sizeFilters.small}
                      onChange={(checked) => handleSizeFilterChange('small', checked)}
                    />
                    <Checkbox
                      label="Medium (1-10MB)"
                      checked={sizeFilters.medium}
                      onChange={(checked) => handleSizeFilterChange('medium', checked)}
                    />
                    <Checkbox
                      label="Large (> 10MB)"
                      checked={sizeFilters.large}
                      onChange={(checked) => handleSizeFilterChange('large', checked)}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quality Score</h4>
                  <div className="space-y-2">
                    <Checkbox
                      label="High (8-10)"
                      checked={qualityFilters.high}
                      onChange={(checked) => handleQualityFilterChange('high', checked)}
                    />
                    <Checkbox
                      label="Medium (6-8)"
                      checked={qualityFilters.medium}
                      onChange={(checked) => handleQualityFilterChange('medium', checked)}
                    />
                    <Checkbox
                      label="Low (4-6)"
                      checked={qualityFilters.low}
                      onChange={(checked) => handleQualityFilterChange('low', checked)}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</h4>
                  <div className="space-y-2">
                    <Checkbox
                      label="Last 7 days"
                      checked={dateFilters.last7days}
                      onChange={(checked) => handleDateFilterChange('last7days', checked)}
                    />
                    <Checkbox
                      label="Last 30 days"
                      checked={dateFilters.last30days}
                      onChange={(checked) => handleDateFilterChange('last30days', checked)}
                    />
                    <Checkbox
                      label="Last year"
                      checked={dateFilters.lastYear}
                      onChange={(checked) => handleDateFilterChange('lastYear', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          items={tabItems}
          activeTab="all"
          onTabChange={(tabId) => console.log('Tab changed:', tabId)}
        />

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loading
                ? 'Loading datasets...'
                : totalDatasets
                ? `Showing ${datasets.length} of ${totalDatasets} datasets`
                : 'No datasets available'}
            </p>
          </div>

          <DatasetList
            datasets={datasets}
            loading={loading}
            variant={viewMode}
            onDatasetView={handleDatasetView}
            onDatasetDownload={handleDatasetDownload}
            emptyMessage="No datasets found"
            emptyDescription="Try adjusting your search or filter criteria to find more datasets."
          />

          {totalDatasets > pageSize && (
            <div className="flex justify-center">
              <Pagination
                current={currentPage}
                total={totalDatasets}
                pageSize={pageSize}
                onChange={handlePageChange}
                showTotal
                showSizeChanger
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
