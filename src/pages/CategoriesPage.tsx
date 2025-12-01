import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { DataCard } from '../components/data-display/DataCard';
import { Badge } from '../components/data-display/Badge';
import { Alert } from '../components/feedback/Alert';
import { Loader } from '../components/feedback/Loader';
import { EmptyState } from '../components/utility/EmptyState';
import { fetchCategories } from '../services/api';
import type { Category } from '../types';

const defaultCategories: Category[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Economic data and indicators',
    icon: '📊',
    datasetCount: 0,
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Healthcare and medical statistics',
    icon: '⚕️',
    datasetCount: 0,
  },
  {
    id: 'education',
    name: 'Education',
    description: 'Educational institutions and outcomes',
    icon: '🎓',
    datasetCount: 0,
  },
  {
    id: 'environment',
    name: 'Environment',
    description: 'Environmental and climate data',
    icon: '🌱',
    datasetCount: 0,
  },
  {
    id: 'transport',
    name: 'Transport',
    description: 'Transportation and infrastructure',
    icon: '🚆',
    datasetCount: 0,
  },
  {
    id: 'social',
    name: 'Social',
    description: 'Social services and demographics',
    icon: '🤝',
    datasetCount: 0,
  },
];

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCategories();
        if (response?.success) {
          const items = Array.isArray(response.data) ? response.data : [];
          const apiMap = new Map<string, Category>();
          items.forEach((item) => {
            if (!item || (!item.id && !item.name)) {
              return;
            }
            const key = item.id || item.name;
            apiMap.set(key, {
              ...item,
              id: key,
              name: item.name || item.id || 'Category',
              icon: item.icon || '📁',
              datasetCount: item.datasetCount ?? 0,
            });
          });

          const mergedDefaults = defaultCategories.map((category) => {
            const apiCategory = apiMap.get(category.id);
            if (apiCategory) {
              apiMap.delete(category.id);
              return {
                ...category,
                description: apiCategory.description || category.description,
                datasetCount: apiCategory.datasetCount ?? 0,
              };
            }
            return category;
          });

          const extraCategories = Array.from(apiMap.values());
          setCategories([...mergedDefaults, ...extraCategories]);
        } else {
          setCategories(defaultCategories);
          setError('Unable to load categories');
        }
      } catch (err) {
        setCategories(defaultCategories);
        setError(err instanceof Error ? err.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId?: string, fallback?: string) => {
    const targetId = categoryId || fallback;
    if (!targetId) {
      return;
    }
    navigate(`/innocivic/datasets?category=${targetId}`);
  };

  const totals = useMemo(() => {
    const totalCategories = categories.length;
    const totalDatasets = categories.reduce((sum, category) => sum + (category.datasetCount ?? 0), 0);
    const averagePerCategory = totalCategories ? Math.round(totalDatasets / totalCategories) : 0;
    return {
      totalCategories,
      totalDatasets,
      averagePerCategory,
    };
  }, [categories]);

  const breadcrumbItems = [
    { label: 'Home', href: '/innocivic' },
    { label: 'Categories', current: true },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={breadcrumbItems}
          onNavigate={(href) => navigate(href)}
        />
        {error && (
          <Alert
            type="error"
            title="Unable to load categories"
            message={error}
          />
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader text="Loading categories..." />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories available"
            description="Once datasets are uploaded with categories, they will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <DataCard
                key={category.id}
                title={category.name}
                subtitle={category.description}
                onClick={() => handleCategoryClick(category.id, category.name)}
                hoverable
              >
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {formatNumber(category.datasetCount ?? 0)} datasets
                  </Badge>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                    View →
                  </button>
                </div>
              </DataCard>
            ))}
          </div>
        )}

        {!loading && categories.length > 0 && (
          <DataCard title="Summary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatNumber(totals.totalCategories)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatNumber(totals.totalDatasets)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Datasets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatNumber(totals.averagePerCategory)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg per Category</div>
              </div>
            </div>
          </DataCard>
        )}
      </div>
    </AppLayout>
  );
};
