import React, { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { DataCard } from '../components/data-display/DataCard';
import { Alert } from '../components/feedback/Alert';
import { Input } from '../components/forms/Input';
import { TextArea } from '../components/forms/TextArea';
import { Select } from '../components/forms/Select';
import { Checkbox } from '../components/forms/Checkbox';
import { DatePicker } from '../components/forms/DatePicker';
import { SubmitButton } from '../components/forms/SubmitButton';
import { FileUpload } from '../components/forms/FileUpload';
import { uploadDatasetFile, createDataset, fetchCategories } from '../services/api';
import { Dataset, UploadedFile } from '../types';

interface CategoryOption {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface CategoryApiResponse {
  success: boolean;
  data: CategoryOption[];
}

const DATASET_FORMAT_OPTIONS = [
  { value: 'CSV', label: 'CSV (Comma-separated values)' },
  { value: 'JSON', label: 'JSON' },
  { value: 'XML', label: 'XML' },
  { value: 'XLSX', label: 'Excel (XLSX)' },
  { value: 'XLS', label: 'Excel (XLS)' },
  { value: 'PDF', label: 'PDF' },
  { value: 'TSV', label: 'TSV (Tab-separated values)' },
  { value: 'ZIP', label: 'ZIP Archive' },
];

const FORMAT_ACCEPT_MAP: Record<string, string[]> = {
  CSV: [ '.csv', 'text/csv', 'application/vnd.ms-excel' ],
  JSON: [ '.json', 'application/json', 'text/json' ],
  XML: [ '.xml', 'application/xml', 'text/xml' ],
  XLSX: [ '.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ],
  XLS: [ '.xls', 'application/vnd.ms-excel' ],
  PDF: [ '.pdf', 'application/pdf' ],
  TSV: [ '.tsv', 'text/tab-separated-values' ],
  ZIP: [ '.zip', 'application/zip', 'application/x-zip-compressed' ],
};

const DEFAULT_CATEGORY: CategoryOption = {
  id: 'general',
  name: 'General',
  description: 'General civic datasets',
};

const normalizeSegment = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'general';

export const UploadPage: React.FC = () => {
  const [ formData, setFormData ] = useState({
    title: '',
    description: '',
    categoryId: '',
    source: '',
    license: 'Open Data',
    format: 'CSV',
    tags: '',
    geographicCoverage: '',
    startDate: '',
    endDate: '',
    status: 'pending',
    isPublic: true,
  });
  const [ selectedFile, setSelectedFile ] = useState<File | null>(null);
  const [ uploadedFiles, setUploadedFiles ] = useState<UploadedFile[]>([]);
  const [ categories, setCategories ] = useState<CategoryOption[]>([ DEFAULT_CATEGORY ]);
  const [ formErrors, setFormErrors ] = useState<Record<string, string>>({});
  const [ submitError, setSubmitError ] = useState<string | null>(null);
  const [ submitSuccess, setSubmitSuccess ] = useState<string | null>(null);
  const [ createdDatasetId, setCreatedDatasetId ] = useState<string | null>(null);
  const [ loadingCategories, setLoadingCategories ] = useState(false);
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  // Paid dataset states
  const [ isPaidDataset, setIsPaidDataset ] = useState(false);
  const [ datasetPrice, setDatasetPrice ] = useState('');

  const acceptedTypes = useMemo(() => FORMAT_ACCEPT_MAP[ formData.format ] ?? [ '*/*' ], [ formData.format ]);

  const fileMatchesAcceptedTypes = (file: File, types: string[]) => {
    if (types.includes('*/*')) {
      return true;
    }

    const fileExtension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase()}` : '';

    return types.some((type) => {
      if (type.startsWith('.')) {
        return type.toLowerCase() === fileExtension;
      }
      if (type.includes('*')) {
        const [ topLevel ] = type.toLowerCase().split('/');
        const [ fileTopLevel ] = file.type.toLowerCase().split('/');
        return topLevel === fileTopLevel;
      }
      return file.type.toLowerCase() === type.toLowerCase();
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = (await fetchCategories()) as CategoryApiResponse;
        if (response?.success && Array.isArray(response.data)) {
          const items = response.data.filter(Boolean) as CategoryOption[];
          setCategories(items.length > 0 ? items : [ DEFAULT_CATEGORY ]);
        }
      } catch (error) {
        console.warn('Failed to fetch categories:', error);
        setCategories([ DEFAULT_CATEGORY ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
    [ categories ],
  );

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [ field ]: value,
    }));
    if (formErrors[ field ]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[ field ];
        return next;
      });
    }

    if (field === 'format' && selectedFile && typeof value === 'string') {
      const nextAccepted = FORMAT_ACCEPT_MAP[ value ] ?? [ '*/*' ];
      if (!fileMatchesAcceptedTypes(selectedFile, nextAccepted)) {
        setSelectedFile(null);
        setUploadedFiles([]);
        setFormErrors((prev) => ({
          ...prev,
          file: 'The previously selected file does not match the chosen format. Please upload a new file.',
        }));
      }
    }
  };

  const handleFileSelect = (files: File[]) => {
    const file = files[ 0 ] ?? null;
    setSelectedFile(file);
    setSubmitSuccess(null);
    setSubmitError(null);

    if (file) {
      if (!fileMatchesAcceptedTypes(file, acceptedTypes)) {
        setFormErrors((prev) => ({
          ...prev,
          file: `The selected file type is not allowed for the chosen format (${formData.format}).`,
        }));
        setSelectedFile(null);
        setUploadedFiles([]);
        return;
      }

      setUploadedFiles([
        {
          id: 'selected-file',
          name: file.name,
          size: file.size,
          type: file.type,
          url: '',
          status: 'pending',
        },
      ]);
      if (!formData.source) {
        handleInputChange('source', file.name.split('.').slice(0, -1).join('.') || 'Community Submission');
      }
    } else {
      setUploadedFiles([]);
    }

    if (formErrors.file) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next.file;
        return next;
      });
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadedFiles([]);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.file;
      return next;
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!selectedFile) {
      errors.file = 'Please select a dataset file to upload';
    }
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Please choose a category';
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.timePeriod = 'Start date must be before end date';
    }
    if (isPaidDataset && (!datasetPrice || parseFloat(datasetPrice) <= 0)) {
      errors.price = 'Please enter a valid price for paid dataset';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      categoryId: '',
      source: '',
      license: 'Open Data',
      format: 'CSV',
      tags: '',
      geographicCoverage: '',
      startDate: '',
      endDate: '',
      status: 'pending',
      isPublic: true,
    });
    setSelectedFile(null);
    setUploadedFiles([]);
    setIsPaidDataset(false);
    setDatasetPrice('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setCreatedDatasetId(null);

    if (!validateForm()) {
      return;
    }

    if (!selectedFile) {
      return;
    }

    setIsSubmitting(true);
    setUploadedFiles((prev) =>
      prev.map((file) => ({
        ...file,
        status: 'processing',
      })),
    );

    try {
      const selectedCategory =
        categories.find((category) => category.id === formData.categoryId) ?? DEFAULT_CATEGORY;

      const uploadResult = await uploadDatasetFile({
        file: selectedFile,
        source: normalizeSegment(formData.source || 'community'),
        subject: normalizeSegment(formData.categoryId || selectedCategory.id),
      });

      const fileUrl =
        typeof (uploadResult as Record<string, unknown>).fileUrl === 'string'
          ? String((uploadResult as Record<string, unknown>).fileUrl)
          : '';

      if (!fileUrl) {
        throw new Error('File upload failed: file URL missing');
      }

      const fileSizeValue = (uploadResult as Record<string, unknown>).fileSize;
      const fileSize =
        typeof fileSizeValue === 'number'
          ? fileSizeValue
          : Number(fileSizeValue) || selectedFile.size;

      const contentTypeValue = (uploadResult as Record<string, unknown>).contentType;
      const contentType =
        typeof contentTypeValue === 'string' && contentTypeValue
          ? contentTypeValue
          : selectedFile.type || 'application/octet-stream';

      const now = new Date().toISOString();
      const startDate = formData.startDate || now.slice(0, 10);
      const endDate = formData.endDate || startDate;

      const datasetPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: {
          id: selectedCategory.id,
          name: selectedCategory.name,
          description: selectedCategory.description,
          icon: selectedCategory.icon,
        },
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        format: formData.format,
        fileUrl,
        fileSize,
        source: formData.source || 'Community Submission',
        license: formData.license || 'Open Data',
        geographicCoverage: formData.geographicCoverage || 'Russian Federation',
        timePeriod: {
          start: startDate,
          end: endDate,
        },
        uploadedBy: {
          id: 'anonymous-user',
          email: 'anonymous@innocivic',
          username: 'anonymous',
          fullName: 'Anonymous Contributor',
          role: 'contributor',
          userType: 'other',
          createdAt: now,
          lastLoginAt: now,
        },
        qualityScore: 0,
        status: formData.status,
        metadata: {
          originalFilename: selectedFile.name,
          contentType,
        },
        version: '1.0',
        isPublic: formData.isPublic,
        previewData: null,
        isPaid: isPaidDataset,
        price: isPaidDataset ? parseFloat(datasetPrice) : 0,
      };

      const createResponse = await createDataset(datasetPayload);
      const createdDataset = (createResponse as Record<string, any>)?.data as Dataset | undefined;

      setUploadedFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: 'completed',
        })),
      );
      setSubmitSuccess('Dataset uploaded successfully!');
      setCreatedDatasetId(createdDataset?.id ?? null);
      resetForm();
    } catch (error) {
      console.error('Upload failed:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Something went wrong while uploading the dataset.',
      );
      setUploadedFiles((prev) =>
        prev.map((file) => ({
          ...file,
          status: 'error',
        })),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Upload Dataset</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Share your data with the InnoCivic community. Provide as much metadata as possible to help others
            discover your work.
          </p>
        </div>

        <DataCard title="Dataset details">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {submitError && (
              <Alert type="error" title="Upload failed" message={submitError} className="mb-4" />
            )}
            {submitSuccess && (
              <Alert
                type="success"
                title="Success"
                message={submitSuccess}
                className="mb-4"
                actions={
                  createdDatasetId ? (
                    <a
                      href={`/datasets/${createdDatasetId}`}
                      className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      View dataset
                    </a>
                  ) : undefined
                }
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Dataset title"
                  placeholder="Russian Economic Indicators 2024"
                  value={formData.title}
                  onChange={(value) => handleInputChange('title', value)}
                  required
                  error={formErrors.title}
                />

                <TextArea
                  label="Description"
                  placeholder="Describe the dataset contents, methodology, and any important context."
                  rows={6}
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                />

                <Select
                  label="Category"
                  placeholder={loadingCategories ? 'Loading categories…' : 'Select a category'}
                  options={categoryOptions}
                  value={formData.categoryId}
                  onChange={(value) => handleInputChange('categoryId', value)}
                  required
                  disabled={loadingCategories}
                  error={formErrors.categoryId}
                  wrapperClassName="dark:text-gray-100"
                />

                <Select
                  label="Format"
                  options={DATASET_FORMAT_OPTIONS}
                  value={formData.format}
                  onChange={(value) => handleInputChange('format', value)}
                  required
                  wrapperClassName="dark:text-gray-100"
                />

                <Input
                  label="Tags"
                  placeholder="economy, gdp, inflation"
                  value={formData.tags}
                  onChange={(value) => handleInputChange('tags', value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Separate tags with commas to improve dataset discovery.
                </p>
              </div>

              <div className="space-y-4">
                <FileUpload
                  label="Dataset file"
                  acceptedTypes={acceptedTypes}
                  maxSize={100}
                  onFileSelect={handleFileSelect}
                  onFileRemove={handleFileRemove}
                  uploadedFiles={uploadedFiles}
                  error={formErrors.file}
                />

                <Input
                  label="Source / Organization"
                  placeholder="Ministry of Economic Development"
                  value={formData.source}
                  onChange={(value) => handleInputChange('source', value)}
                />

                <Input
                  label="License"
                  placeholder="Open Data Commons"
                  value={formData.license}
                  onChange={(value) => handleInputChange('license', value)}
                />

                <Input
                  label="Geographic coverage"
                  placeholder="Russian Federation"
                  value={formData.geographicCoverage}
                  onChange={(value) => handleInputChange('geographicCoverage', value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DatePicker
                    label="Start date"
                    value={formData.startDate}
                    onChange={(value) => handleInputChange('startDate', value)}
                    max={formData.endDate || undefined}
                    className="dark:text-gray-100"
                  />
                  <DatePicker
                    label="End date"
                    value={formData.endDate}
                    onChange={(value) => handleInputChange('endDate', value)}
                    min={formData.startDate || undefined}
                    className="dark:text-gray-100"
                  />
                </div>
                {formErrors.timePeriod && (
                  <p className="text-sm text-red-600">{formErrors.timePeriod}</p>
                )}

                <Select
                  label="Status"
                  options={[
                    { value: 'pending', label: 'Pending review' },
                    { value: 'approved', label: 'Public' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  wrapperClassName="dark:text-gray-100"
                />

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    Dataset Access Type
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="accessType"
                        checked={!isPaidDataset}
                        onChange={() => {
                          setIsPaidDataset(false);
                          setDatasetPrice('');
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Free Download
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Anyone can download this dataset for free
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="accessType"
                        checked={isPaidDataset}
                        onChange={() => setIsPaidDataset(true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Paid Download
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Users must pay to download this dataset
                        </div>

                        {isPaidDataset && (
                          <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Price (₽)
                            </label>
                            <input
                              type="number"
                              placeholder="499"
                              value={datasetPrice}
                              onChange={(e) => {
                                setDatasetPrice(e.target.value);
                                if (formErrors.price) {
                                  setFormErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.price;
                                    return next;
                                  });
                                }
                              }}
                              min="1"
                              step="1"
                              required={isPaidDataset}
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${formErrors.price
                                  ? 'border-red-500 dark:border-red-500'
                                  : 'border-gray-300 dark:border-gray-600'
                                }`}
                            />
                            {formErrors.price && (
                              <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <Checkbox
                  label="Make dataset public"
                  checked={formData.isPublic}
                  onChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <SubmitButton type="submit" loading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? 'Uploading…' : 'Upload dataset'}
              </SubmitButton>
            </div>
          </form>
        </DataCard>
      </div>
    </AppLayout>
  );
};
