import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Breadcrumbs } from '../components/navigation/Breadcrumbs';
import { DatasetDetail } from '../features/datasets/components/DatasetDetail';
import { Loader } from '../components/feedback/Loader';
import { Alert } from '../components/feedback/Alert';
import { Dataset } from '../types';
import { fetchDatasetById, API_BASE_URL } from '../services/api';

export const DatasetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        if (!id) {
          setDataset(null);
          setError('Dataset not found');
          return;
        }

        const response = await fetchDatasetById(id);
        if (response?.success) {
          setDataset(response.data);
          setError(null);
        } else {
          setDataset(null);
          setError('Dataset not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dataset');
        setDataset(null);
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
    if (!datasetId) {
      return;
    }
    window.location.href = `${API_BASE_URL}/api/datasets/${encodeURIComponent(datasetId)}/download`;
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
