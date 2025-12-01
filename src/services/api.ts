import type { Dataset, Category } from '../types';

const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export const API_BASE_URL = 'https://innocivicapi.ru';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  [key: string]: unknown;
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      typeof payload === 'object' && payload !== null && 'detail' in payload
        ? String((payload as { detail: unknown }).detail)
        : response.statusText;
    throw new Error(errorMessage || 'Request failed');
  }

  return payload as T;
};

export const fetchCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  return handleResponse<ApiResponse<Category[]>>(response);
};

export interface UploadDatasetFileParams {
  file: File;
  source: string;
  subject: string;
}

export const uploadDatasetFile = async ({ file, source, subject }: UploadDatasetFileParams) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `${API_BASE_URL}/upload/${encodeURIComponent(source)}/${encodeURIComponent(subject)}`,
    {
      method: 'POST',
      body: formData,
    },
  );

  return handleResponse<Record<string, unknown>>(response);
};

export const createDataset = async (payload: Record<string, unknown>) => {
  const response = await fetch(`${API_BASE_URL}/api/datasets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<ApiResponse<Record<string, unknown>>>(response);
};

export interface DatasetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  format?: string;
  tag?: string;
  status?: string;
  isPublic?: boolean;
  sort?: 'recent' | 'popular' | 'name' | 'size';
}

const buildQueryString = (params: DatasetQueryParams = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.set(key, String(value));
  });
  return query.toString();
};

export const fetchDatasets = async (params: DatasetQueryParams = {}) => {
  const queryString = buildQueryString(params);
  const url = queryString ? `${API_BASE_URL}/api/datasets?${queryString}` : `${API_BASE_URL}/api/datasets`;
  const response = await fetch(url);
  return handleResponse<ApiResponse<Dataset[]>>(response);
};

export const fetchDatasetById = async (datasetId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/datasets/${encodeURIComponent(datasetId)}`);
  return handleResponse<ApiResponse<Dataset>>(response);
};
