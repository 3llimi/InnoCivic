import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { SearchBar } from '../components/forms/SearchBar';
import { DataCard } from '../components/data-display/DataCard';
import { Badge } from '../components/data-display/Badge';
import { Dataset, ChartData } from '../types';

// Mock data for demonstration
const featuredDatasets: Dataset[] = [
  {
    id: '1',
    title: 'Russian Economic Indicators 2023',
    description: 'Comprehensive economic data including GDP, inflation, and employment statistics',
    category: { id: '1', name: 'Economy', description: 'Economic data', icon: '📊' },
    tags: ['economy', 'gdp', 'inflation', 'employment'],
    format: 'CSV',
    fileSize: 2048576,
    fileUrl: '/datasets/economy-2023.csv',
    source: 'Ministry of Economic Development',
    license: 'Open Data',
    geographicCoverage: 'Russian Federation',
    timePeriod: { start: '2023-01-01', end: '2023-12-31' },
    uploadedBy: {
      id: '1',
      email: 'analyst@example.com',
      username: 'econ_analyst',
      fullName: 'Economic Analyst',
      role: 'contributor',
      userType: 'researcher',
      affiliation: 'Ministry of Economic Development',
      createdAt: '2023-01-01T00:00:00Z',
      lastLoginAt: '2024-01-01T00:00:00Z',
    },
    uploadedAt: '2024-01-15T10:30:00Z',
    lastUpdated: '2024-01-15T10:30:00Z',
    downloadCount: 1250,
    viewCount: 3200,
    qualityScore: 9,
    status: 'approved',
    metadata: {},
    version: '1.0',
    isPublic: true,
  },
  // Add more mock datasets...
];

const categoryStats: ChartData[] = [
  { name: 'Economy', value: 45 },
  { name: 'Health', value: 32 },
  { name: 'Education', value: 28 },
  { name: 'Environment', value: 22 },
  { name: 'Transport', value: 18 },
  { name: 'Social', value: 15 },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/innocivic/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleDatasetView = (id: string) => {
    navigate(`/innocivic/datasets/${id}`);
  };

  const handleDatasetDownload = (id: string) => {
    console.log('Downloading dataset:', id);
    // Implement download logic
  };

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
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DataCard title="Total Datasets" className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,247</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">+12 this week</p>
          </DataCard>
          <DataCard title="Active Users" className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">3,456</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">+8% this month</p>
          </DataCard>
          <DataCard title="Downloads" className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">15,789</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">+25% this month</p>
          </DataCard>
          <DataCard title="Categories" className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">24</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Covering all sectors</p>
          </DataCard>
        </section>

        {/* Featured Datasets */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Datasets</h2>
            <Badge variant="primary">New This Week</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDatasets.slice(0, 3).map((dataset) => (
              <DataCard
                key={dataset.id}
                title={dataset.title}
                subtitle={dataset.description}
                onClick={() => handleDatasetView(dataset.id)}
                hoverable
              >
                  <div className="space-y-2">
                    <Badge variant="primary" size="sm">
                      {dataset.category.name}
                    </Badge>
                    <Badge variant="secondary" size="sm">
                      {dataset.format}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {dataset.downloadCount} downloads • {dataset.viewCount} views
                    </p>
                  </div>
              </DataCard>
            ))}
          </div>
        </section>

        {/* Category Distribution */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dataset Categories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <DataCard title="Distribution by Category">
              <div className="space-y-2">
                {categoryStats.map((stat, index) => (
                  <div key={stat.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{stat.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(stat.value / 50) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DataCard>

            <DataCard title="Popular Tags">
              <div className="space-y-2">
                {['economy', 'health', 'education', 'transport', 'environment'].map((tag, index) => (
                  <div key={tag} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{tag}</span>
                    <Badge variant="secondary" size="sm">
                      {Math.floor(Math.random() * 100) + 50}
                    </Badge>
                  </div>
                ))}
              </div>
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
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 font-medium"
            >
              Upload Dataset
            </button>
            <button
              onClick={() => navigate('/datasets')}
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
