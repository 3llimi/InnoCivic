import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { DataCard } from '../components/data-display/DataCard';
import { Badge } from '../components/data-display/Badge';

const categories = [
  { id: 'economy', name: 'Economy', count: 245, description: 'Economic data and indicators' },
  { id: 'health', name: 'Health', count: 178, description: 'Healthcare and medical statistics' },
  { id: 'education', name: 'Education', count: 162, description: 'Educational institutions and outcomes' },
  { id: 'environment', name: 'Environment', count: 134, description: 'Environmental and climate data' },
  { id: 'transport', name: 'Transport', count: 98, description: 'Transportation and infrastructure' },
  { id: 'social', name: 'Social', count: 87, description: 'Social services and demographics' },
];

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    navigate(`innocivic/categories/${categoryId}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Categories</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <DataCard
              key={category.id}
              title={category.name}
              subtitle={category.description}
              onClick={() => handleCategoryClick(category.id)}
              hoverable
            >
              <div className="flex items-center justify-between">
                <Badge variant="primary" size="sm">
                  {category.count} datasets
                </Badge>
                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                  View →
                </button>
              </div>
            </DataCard>
          ))}
        </div>

        <DataCard title="Summary">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{categories.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {categories.reduce((sum, cat) => sum + cat.count, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Datasets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(categories.reduce((sum, cat) => sum + cat.count, 0) / categories.length)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg per Category</div>
            </div>
          </div>
        </DataCard>
      </div>
    </AppLayout>
  );
};
