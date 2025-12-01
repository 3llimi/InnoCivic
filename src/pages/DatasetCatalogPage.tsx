import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SearchBar } from '../components/forms/SearchBar';
import { Select } from '../components/forms/Select';
import { Checkbox } from '../components/forms/Checkbox';
import { Tabs } from '../components/navigation/Tabs';
import { Pagination } from '../components/navigation/Pagination';
import { DatasetList } from '../features/datasets/components/DatasetList';
import { Dataset } from '../types';
import { fetchDatasets, API_BASE_URL, fetchCategories } from '../services/api';
import { Alert } from '../components/feedback/Alert';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';

const defaultCategoryOptions = [
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

const parseDate = (value?: string) => {
  if (!value) {
    return 0;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortDatasets = (items: Dataset[], sort: string) => {
  const cloned = [...items];
  if (sort === 'popular') {
    return cloned.sort(
      (a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0),
    );
  }

  if (sort === 'recent') {
    return cloned.sort(
      (a, b) => parseDate(b.uploadedAt || b.lastUpdated) - parseDate(a.uploadedAt || a.lastUpdated),
    );
  }

  return cloned;
};

export const DatasetCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { category: categoryParam } = useParams<{ category?: string }>();
  const searchParamsString = searchParams.toString();
  const initialSortParam = searchParams.get('sort') || 'recent';

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categoryOptions, setCategoryOptions] = useState(defaultCategoryOptions);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  useEffect(() => {
    const loadCategoryOptions = async () => {
      try {
        const response = await fetchCategories();
        if (response?.success) {
          const items = Array.isArray(response.data) ? response.data : [];
          setCategoryOptions([
            defaultCategoryOptions[0],
            ...items
              .filter((item) => item.id && item.name)
              .map((item) => ({
                value: item.id,
                label: item.name,
              })),
          ]);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    loadCategoryOptions();
  }, []);

  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(initialSortParam);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'popular'>(
    initialSortParam === 'popular' ? 'popular' : initialSortParam === 'recent' ? 'recent' : 'all',
  );
  const [isTabAnimating, setIsTabAnimating] = useState(false);

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
          const sortedItems = sortDatasets(items, sortBy);
          setDatasets(sortedItems);
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
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all') {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      return newParams;
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString);
    const urlQuery = params.get('q') || '';
    const urlCategory = params.get('category') || 'all';
    const urlFormat = params.get('format') || 'all';
    const urlSort = params.get('sort') || 'recent';

    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
    if (urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }
    if (urlFormat !== selectedFormat) {
      setSelectedFormat(urlFormat);
    }
    if (urlSort !== sortBy) {
      setSortBy(urlSort);
    }
  }, [searchParamsString]);

  useEffect(() => {
    if (!categoryParam) {
      return;
    }

    setSelectedCategory(categoryParam);
    setCurrentPage(1);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('category', categoryParam);
      return next;
    }, { replace: true });
  }, [categoryParam, setSearchParams]);

  const formatCategoryLabel = (value: string) => {
    const matchedCategory = categoryOptions.find((category) => category.value === value);
    return matchedCategory?.label || value;
  };

  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; href?: string; current?: boolean }> = [
      { label: 'Home', href: '/innocivic' },
    ];

    if (selectedCategory !== 'all') {
      items.push({ label: 'Categories', href: '/innocivic/categories' });
      items.push({
        label: formatCategoryLabel(selectedCategory),
        href: `/innocivic/datasets?category=${selectedCategory}`,
      });
    } else {
      items.push({ label: 'Datasets', href: '/innocivic/datasets' });
    }

    if (searchQuery.trim()) {
      items.push({
        label: `Search: ${searchQuery.trim()}`,
        current: true,
      });
    } else {
      items[items.length - 1] = { ...items[items.length - 1], current: true };
    }

    return items;
  }, [searchQuery, selectedCategory]);

  const emptyStateAction = (
    <button
      type="button"
      onClick={() => navigate('/innocivic/categories')}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Browse categories
    </button>
  );

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

  const handleTabChange = (tabId: string) => {
    if (tabId !== 'all' && tabId !== 'recent' && tabId !== 'popular') {
      return;
    }

    setIsTabAnimating(true);
    setActiveTab(tabId);
    if (tabId === 'recent') {
      handleSortChange('recent');
    } else if (tabId === 'popular') {
      handleSortChange('popular');
    } else {
      handleSortChange('recent');
    }
  };

  useEffect(() => {
    if (!isTabAnimating) {
      return;
    }
    const timer = window.setTimeout(() => setIsTabAnimating(false), 250);
    return () => window.clearTimeout(timer);
  }, [isTabAnimating]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDatasetView = (id: string) => {
    navigate(`/innocivic/datasets/${id}`);
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
          <Breadcrumbs
            items={breadcrumbItems}
            onNavigate={(href) => navigate(href)}
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dataset Catalog</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse and discover public datasets from across Russia
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              aria-expanded={showFilters}
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
                onChange={setSearchQuery}
                onSearch={handleSearch}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full lg:w-auto">
              <Select
                options={categoryOptions}
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
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block mt-6 pt-6 border-t border-gray-200 dark:border-gray-700`}>
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
        </div>

        {/* Tabs */}
        <Tabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Results */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loading
                ? 'Loading datasets...'
                : totalDatasets
                ? `Showing ${datasets.length} of ${totalDatasets} datasets`
                : 'No datasets available'}
            </p>
          </div>

          <div
            className={`transform transition-all duration-300 ${
              isTabAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
            }`}
          >
            <DatasetList
              datasets={datasets}
              loading={loading}
              variant={viewMode}
              onDatasetView={handleDatasetView}
              onDatasetDownload={handleDatasetDownload}
              emptyMessage="No datasets found"
              emptyDescription="Try adjusting your search or filter criteria to find more datasets."
              emptyAction={emptyStateAction}
            />
          </div>

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
