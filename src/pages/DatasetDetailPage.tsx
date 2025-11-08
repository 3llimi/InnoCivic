import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { DatasetDetail } from '../features/datasets/components/DatasetDetail';
import { Loader } from '../components/feedback/Loader';
import { Alert } from '../components/feedback/Alert';
import { Dataset } from '../types';

export const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock dataset data
        const mockDataset: Dataset = {
          id: id || '1',
          title: 'Russian Economic Indicators 2023',
          description: 'Comprehensive economic data including GDP, inflation, and employment statistics for the Russian Federation in 2023.',
          category: { id: '1', name: 'Economy', description: 'Economic data', icon: '📊' },
          tags: ['economy', 'gdp', 'inflation', 'employment', 'russia', '2023'],
          format: 'CSV',
          fileSize: 2048576,
          fileUrl: 'innocivic/datasets/economy-2023.csv',
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
          metadata: {
            'Data Source': 'Ministry of Economic Development',
            'Update Frequency': 'Monthly',
            'Language': 'Russian',
            'Encoding': 'UTF-8',
            'Delimiter': 'Comma',
            'Headers': 'Yes',
          },
          version: '1.0',
          isPublic: true,
          previewData: [
            { month: 'January', gdp: 125000, inflation: 5.2, unemployment: 4.1 },
            { month: 'February', gdp: 128000, inflation: 5.1, unemployment: 4.0 },
            { month: 'March', gdp: 130000, inflation: 4.9, unemployment: 3.9 },
            { month: 'April', gdp: 132000, inflation: 4.8, unemployment: 3.8 },
            { month: 'May', gdp: 135000, inflation: 4.7, unemployment: 3.7 },
          ],
        };

        setDataset(mockDataset);
      } catch (err) {
        setError('Failed to load dataset');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDataset();
    }
  }, [id]);

  const breadcrumbItems = [
    { label: 'Home', href: '/innocivic' },
    { label: 'Datasets', href: '/innocivic/datasets' },
    { label: dataset?.category.name || 'Category', href: `/innocivic/datasets?category=${dataset?.category.name}` },
    { label: dataset?.title || 'Dataset', current: true },
  ];

  const handleDownload = (datasetId: string) => {
    console.log('Downloading dataset:', datasetId);
    // Implement download logic
  };

  const handleShare = (datasetId: string) => {
    console.log('Sharing dataset:', datasetId);
    // Implement share logic
  };

  const handleRate = (datasetId: string, rating: number) => {
    console.log('Rating dataset:', datasetId, rating);
    // Implement rating logic
  };

  const handleComment = (datasetId: string, comment: string) => {
    console.log('Commenting on dataset:', datasetId, comment);
    // Implement comment logic
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-96">
          <Loader size="lg" text="Loading dataset..." />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Alert
            type="error"
            title="Error loading dataset"
            message={error}
          />
        </div>
      </AppLayout>
    );
  }

  if (!dataset) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <Alert
            type="error"
            title="Dataset not found"
            message="The requested dataset could not be found."
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <DatasetDetail
          dataset={dataset}
          onDownload={handleDownload}
          onShare={handleShare}
          onRate={handleRate}
          onComment={handleComment}
        />
      </div>
    </AppLayout>
  );
};
