import React from 'react';
import { SearchBar } from '../../../components/forms/SearchBar';
import { BaseComponentProps, SearchSuggestion } from '../../../types';

interface SearchInputProps extends BaseComponentProps {
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  placeholder = 'Search datasets, categories, tags...',
  className = '',
}) => {
  return (
    <div className={className}>
      <SearchBar
        placeholder={placeholder}
        onSearch={onSearch}
        suggestions={suggestions}
        onSuggestionSelect={onSuggestionSelect}
        loading={loading}
        showSuggestions={true}
        maxSuggestions={8}
      />
    </div>
  );
};
