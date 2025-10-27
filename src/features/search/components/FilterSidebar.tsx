import React from 'react';
import { DataCard } from '../../../components/data-display/DataCard';
import { Checkbox } from '../../../components/forms/Checkbox';
import { Select } from '../../../components/forms/Select';
import { DatePicker } from '../../../components/forms/DatePicker';
import { Chip } from '../../../components/data-display/Chip';
import { BaseComponentProps, SearchFilters } from '../../../types';

interface FilterSidebarProps extends BaseComponentProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: { value: string; label: string }[];
  formats: { value: string; label: string }[];
  popularTags: string[];
  onTagSelect?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  categories,
  formats,
  popularTags,
  onTagSelect,
  onTagRemove,
  className = '',
}) => {
  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...(filters.categories || []), category]
      : (filters.categories || []).filter(c => c !== category);

    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleFormatChange = (format: string, checked: boolean) => {
    const newFormats = checked
      ? [...(filters.formats || []), format]
      : (filters.formats || []).filter(f => f !== format);

    onFiltersChange({ ...filters, formats: newFormats });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const current = filters.dateRange || { start: '', end: '' };
    const newDateRange: { start: string; end: string } = {
      start: field === 'start' ? value : current.start,
      end: field === 'end' ? value : current.end,
    };
    onFiltersChange({ ...filters, dateRange: newDateRange });
  };

  const handleQualityScoreChange = (min: number, max: number) => {
    onFiltersChange({ ...filters, qualityScore: { min, max } });
  };

  const handleTagAdd = (tag: string) => {
    const newTags = [...(filters.tags || []), tag];
    onFiltersChange({ ...filters, tags: newTags });
    onTagSelect?.(tag);
  };

  const handleTagRemove = (tag: string) => {
    const newTags = (filters.tags || []).filter(t => t !== tag);
    onFiltersChange({ ...filters, tags: newTags });
    onTagRemove?.(tag);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof SearchFilters];
    return Array.isArray(value) ? value.length > 0 : value !== undefined;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Filters */}
      {hasActiveFilters && (
        <DataCard title="Active Filters">
          <div className="space-y-2">
            {filters.categories?.map(category => (
              <Chip
                key={category}
                removable
                onRemove={() => handleCategoryChange(category, false)}
              >
                Category: {category}
              </Chip>
            ))}
            {filters.formats?.map(format => (
              <Chip
                key={format}
                removable
                onRemove={() => handleFormatChange(format, false)}
              >
                Format: {format}
              </Chip>
            ))}
            {filters.tags?.map(tag => (
              <Chip
                key={tag}
                removable
                onRemove={() => handleTagRemove(tag)}
              >
                {tag}
              </Chip>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all filters
            </button>
          </div>
        </DataCard>
      )}

      {/* Categories */}
      <DataCard title="Categories">
        <div className="space-y-2">
          {categories.map(category => (
            <Checkbox
              key={category.value}
              label={`${category.label} (${Math.floor(Math.random() * 100) + 10})`}
              checked={filters.categories?.includes(category.value) || false}
              onChange={(checked) => handleCategoryChange(category.value, checked)}
            />
          ))}
        </div>
      </DataCard>

      {/* File Formats */}
      <DataCard title="File Formats">
        <div className="space-y-2">
          {formats.map(format => (
            <Checkbox
              key={format.value}
              label={`${format.label} (${Math.floor(Math.random() * 50) + 5})`}
              checked={filters.formats?.includes(format.value) || false}
              onChange={(checked) => handleFormatChange(format.value, checked)}
            />
          ))}
        </div>
      </DataCard>

      {/* Date Range */}
      <DataCard title="Date Range">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <DatePicker
              value={filters.dateRange?.start || ''}
              onChange={(value) => handleDateRangeChange('start', value)}
              placeholder="Start date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <DatePicker
              value={filters.dateRange?.end || ''}
              onChange={(value) => handleDateRangeChange('end', value)}
              placeholder="End date"
            />
          </div>
        </div>
      </DataCard>

      {/* Quality Score */}
      <DataCard title="Quality Score">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="10"
              value={filters.qualityScore?.min || 0}
              onChange={(e) => handleQualityScoreChange(
                parseInt(e.target.value),
                filters.qualityScore?.max || 10
              )}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-8">
              {filters.qualityScore?.min || 0}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="10"
              value={filters.qualityScore?.max || 10}
              onChange={(e) => handleQualityScoreChange(
                filters.qualityScore?.min || 0,
                parseInt(e.target.value)
              )}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-8">
              {filters.qualityScore?.max || 10}
            </span>
          </div>
        </div>
      </DataCard>

      {/* Popular Tags */}
      <DataCard title="Popular Tags">
        <div className="flex flex-wrap gap-2">
          {popularTags.map(tag => (
            <Chip
              key={tag}
              size="sm"
              variant="default"
              clickable
              onClick={() => handleTagAdd(tag)}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </DataCard>
    </div>
  );
};
