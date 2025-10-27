import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataCard } from '../components/data-display/DataCard';
import { Tabs } from '../components/navigation/Tabs';
import { DatasetList } from '../features/datasets/components/DatasetList';
import { BarChart } from '../features/visualizations/components/BarChart';
import { User, Dataset, ChartData } from '../types';

// Mock data
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  username: 'civic_researcher',
  fullName: 'Alex Petrov',
  role: 'contributor',
  userType: 'researcher',
  affiliation: 'Moscow State University',
  avatarUrl: '/avatars/alex-petrov.jpg',
  bio: 'Civic data researcher focused on economic indicators and social trends.',
  createdAt: '2023-01-01T00:00:00Z',
  lastLoginAt: '2024-01-01T00:00:00Z',
};

const mockDatasets: Dataset[] = [
  // Add mock datasets here
];

const mockStats: ChartData[] = [
  { name: 'Jan', value: 12 },
  { name: 'Feb', value: 19 },
  { name: 'Mar', value: 15 },
  { name: 'Apr', value: 22 },
  { name: 'May', value: 18 },
  { name: 'Jun', value: 25 },
];

export const UserDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleDatasetView = (id: string) => {
    console.log('Viewing dataset:', id);
  };

  const handleDatasetDownload = (id: string) => {
    console.log('Downloading dataset:', id);
  };

  const tabItems = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <DataCard title="My Datasets" className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 transition-colors duration-300">12</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">+2 this month</p>
            </DataCard>
            <DataCard title="Downloads" className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 transition-colors duration-300">1,247</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">+15% this month</p>
            </DataCard>
            <DataCard title="Views" className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 transition-colors duration-300">3,456</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">+8% this month</p>
            </DataCard>
            <DataCard title="Reputation" className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 transition-colors duration-300">1,250</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">+50 this week</p>
            </DataCard>
          </div>

          {/* Activity Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DataCard title="Upload Activity">
              <BarChart
                data={mockStats}
                xAxisKey="name"
                yAxisKey="value"
                height={300}
                colors={['#3B82F6']}
                showLegend={false}
              />
            </DataCard>

            <DataCard title="Recent Activity">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dataset approved</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Economic Indicators 2023</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">New download</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Health Statistics Q4</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">5 hours ago</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dataset pending review</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Transportation Data</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">1 day ago</span>
                </div>
              </div>
            </DataCard>
          </div>
        </div>
      ),
    },
    {
      id: 'datasets',
      label: 'My Datasets',
      content: (
        <DatasetList
          datasets={mockDatasets}
          variant="grid"
          onDatasetView={handleDatasetView}
          onDatasetDownload={handleDatasetDownload}
          emptyMessage="No datasets uploaded yet"
          emptyDescription="Start contributing by uploading your first dataset."
          emptyAction={
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Upload Dataset
            </button>
          }
        />
      ),
    },
    {
      id: 'downloads',
      label: 'My Downloads',
      content: (
        <DatasetList
          datasets={[]}
          variant="list"
          onDatasetView={handleDatasetView}
          onDatasetDownload={handleDatasetDownload}
          emptyMessage="No downloads yet"
          emptyDescription="Browse the catalog to find interesting datasets to download."
          emptyAction={
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Browse Datasets
            </button>
          }
        />
      ),
    },
    {
      id: 'visualizations',
      label: 'My Visualizations',
      content: (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No visualizations yet</h3>
          <p className="text-gray-500 mb-4">Create your first data visualization from your datasets.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Create Visualization
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
          {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center transition-colors duration-300">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {mockUser.fullName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-300">{mockUser.fullName}</h1>
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{mockUser.affiliation}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{mockUser.userType} • Member since {new Date(mockUser.createdAt).getFullYear()}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          items={tabItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
          fullWidth
        />
      </div>
    </AppLayout>
  );
};
