import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { DatasetCatalogPage } from '../pages/DatasetCatalogPage';
import { DatasetDetailPage } from '../pages/DatasetDetailPage';
import { UserDashboardPage } from '../pages/UserDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { VisualizationsPage } from '../pages/VisualizationsPage';
import { UploadPage } from '../pages/UploadPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

const router = createBrowserRouter([
  {
    path: '/innocivic',
    element: <HomePage />,
  },
  {
    path: '/innocivic/datasets',
    element: <DatasetCatalogPage />,
  },
  {
    path: '/innocivic/datasets/:id',
    element: <DatasetDetailPage />,
  },
  {
    path: '/innocivic/dashboard',
    element: <UserDashboardPage />,
  },
  {
    path: '/innocivic/login',
    element: <LoginPage />,
  },
  {
    path: '/innocivic/register',
    element: <LoginPage />, // For now, redirect to login
  },
  {
    path: '/innocivic/categories',
    element: <CategoriesPage />, // Categories listing page
  },
  {
    path: '/innocivic/categories/:category',
    element: <DatasetCatalogPage />, // Category page with parameter
  },
  {
    path: '/innocivic/visualizations',
    element: <VisualizationsPage />, // Visualizations page
  },
  {
    path: '/innocivic/upload',
    element: <UploadPage />, // Upload page
  },
  {
    path: '/innocivic/search',
    element: <DatasetCatalogPage />, // Search results page
  },
  {
    path: '/innocivic/404',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">Page not found</p>
          <a
            href="/innocivic"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Home
          </a>
        </div>
      </div>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/innocivic/404" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};
